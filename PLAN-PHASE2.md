# Phase 2 — Payments + Polish Implementation Plan

## Preamble and Conventions

Builds on Phase 1 (see `PLAN.md`). Same layered rules apply: controllers → services → repositories, no lane-crossing. `proxy.ts` (repo root) is this project's Clerk middleware — route matcher gets new protected paths in Stage 1.

Route matcher note: current `proxy.ts` protects `/dashboard(.*)`, `/api/upload(.*)`, `/api/jobs(.*)`, `/api/brand-kit(.*)`. Stage 1 adds `/api/billing(.*)` to that list — the webhook route lives under `/api/webhooks/razorpay`, not `/api/billing`, so it's outside the matcher automatically (Razorpay can't send a Clerk session), same pattern as the existing Clerk webhook.

---

## Stage 1 — Razorpay Subscriptions + Webhooks (implemented)

Stripe was the original plan for this stage but was never built — Stripe is invite-only in India with no self-serve signup. Switched to Razorpay before writing any code; see `CLAUDE.md`'s "Payments — Razorpay, not Stripe" product decision. This section reflects what actually shipped.

### Ordering constraint
Phase 1 complete (User model, Clerk auth, Mongo working).

### Files created

```
src/lib/razorpay.ts                        (Razorpay SDK client singleton + verifyWebhookSignature helper)
src/models/User.ts                         (extend — razorpaySubscriptionId, razorpayCustomerId, subscriptionStatus)
src/repositories/user.repository.ts        (extend — findByRazorpaySubscriptionId, setPendingSubscription, updateSubscriptionStatus)
src/repositories/job.repository.ts         (extend — countRendersThisMonth, free-tier gate)
src/services/billing.service.ts            (createSubscription, cancelSubscription, handleWebhookEvent, canRender)
src/controllers/billing.controller.ts      (request/response only)
app/api/billing/subscribe/route.ts         (POST — create Subscription, return short_url)
app/api/billing/cancel/route.ts            (POST — cancel own subscription; the Customer Portal substitute)
app/api/webhooks/razorpay/route.ts         (POST — HMAC-verified event handler)
config/env.ts                              (extend — Razorpay env vars)
proxy.ts                                   (extend matcher — /api/billing protected, webhook stays public)
app/dashboard/billing/page.tsx             (plan status, renders-this-month, subscribe/cancel — actual repo uses app/dashboard, not a (dashboard) route group)
components/billing-actions.tsx             (client component — subscribe/cancel buttons)
components/sidebar.tsx                     (extend — Billing nav link, dynamic plan badge)
app/dashboard/layout.tsx                   (extend — fetch subscriptionStatus, pass to Sidebar)
src/controllers/job.controller.ts          (extend — canRender gate + watermark in handleTriggerRender)
src/types/job.types.ts                     (extend — watermark on RenderJobPayload)
worker/render.ts                           (extend — thread watermark into inputProps, unused by compositions yet)
```

### Packages

```bash
razorpay    # v2.9.6 — server SDK, confirmed against actual package source, not docs/memory
```

No client-side package — Subscription Link needs no embedded JS widget (`checkout.js`), just a redirect to the `short_url` the create call returns.

### Key details

**Razorpay dashboard setup (manual, before code):**
1. Razorpay account, complete business KYC (required to go live; test mode works without full KYC for development).
2. Create a Plan — `razorpay.plans.create({ item: { name, amount, currency: 'INR' }, period: 'monthly', interval: 1 })` — note the returned `id` into `RAZORPAY_PLAN_ID`.
3. Webhook config: URL `https://<domain>/api/webhooks/razorpay`, subscribe to `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`. Copy the webhook secret.

**`config/env.ts` additions:**
```typescript
RAZORPAY_KEY_ID: z.string().min(1),
RAZORPAY_KEY_SECRET: z.string().min(1),
RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
RAZORPAY_PLAN_ID: z.string().min(1),
NEXT_PUBLIC_APP_URL: z.string().url(),
```

**Razorpay client (`src/lib/razorpay.ts`):**
```typescript
// export function getRazorpay(): Razorpay {
//   if (global._razorpay) return global._razorpay
//   global._razorpay = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
//   return global._razorpay
// }
// export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
//   return Razorpay.validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)
// }
```
Singleton, same pattern as `src/lib/mongo.ts` / `src/lib/redis.ts`. `validateWebhookSignature` is a static method on the `Razorpay` class (confirmed by reading the actual SDK source, `razorpay-utils.js` — HMAC-SHA256 over the raw body, not just trusted from type defs).

**`User` model additions:**
```typescript
razorpaySubscriptionId: string | null   // indexed — webhook lookups go subscription-id → user
razorpayCustomerId: string | null       // only populated after the webhook confirms the authorization payment; Razorpay has no customer_id param at creation time
subscriptionStatus: 'none' | 'active' | 'halted' | 'cancelled'
```

**Subscription creation (`billing.service.ts`):**
```typescript
// createSubscription(clerkId):
//   razorpay.subscriptions.create({
//     plan_id: env.RAZORPAY_PLAN_ID,
//     total_count: 1200,        // Razorpay subscriptions are bounded, not infinite like Stripe — 1200 monthly cycles = 100yr, the practical "unlimited" proxy
//     customer_notify: true,
//     notes: { clerkId },
//   })
//   setPendingSubscription(clerkId, subscription.id)   // status stays 'none' until the webhook confirms
//   return { shortUrl: subscription.short_url }        // controller redirects
```

**No post-payment redirect.** Razorpay's Create Subscription API has no `callback_url`/`success_url` param — confirmed against official docs, not assumed from the Stripe-shaped mental model. The user lands on Razorpay's hosted confirmation page after paying with no automatic bounce back. Mitigated with a same-tab redirect (`window.location.href`, not a new tab) so the back button returns them to `/dashboard/billing`, which is a server component that reads `subscriptionStatus` fresh on every load.

**Webhook handler (`app/api/webhooks/razorpay/route.ts` → `billing.controller.ts` → `billing.service.ts`):**
```typescript
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()                          // RAW body — req.json() breaks signature verify, same trap as Stripe/Clerk
  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  if (!verifyWebhookSignature(body, signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(body)
  // subscription.authenticated → capture razorpayCustomerId opportunistically, no status change
  // subscription.activated     → subscriptionStatus: 'active'
  // subscription.charged       → no-op, already active
  // subscription.halted        → subscriptionStatus: 'halted'
  // subscription.cancelled     → subscriptionStatus: 'cancelled'
  // anything else (updated/pending/paused/resumed/completed) → explicit no-op default, not a crash
}
```
All handlers are idempotent upserts keyed on `razorpaySubscriptionId` — Razorpay can retry/resend events, re-processing the same event twice must be a no-op.

**Cancel flow — no Razorpay Customer Portal equivalent exists** (confirmed via research; Razorpay's subscription management is API/Dashboard-only for merchants). Built the one action that matters for MVP as our own route: `POST /api/billing/cancel` → `razorpay.subscriptions.cancel(subscriptionId, /* cancelAtCycleEnd */ true)`. Local `subscriptionStatus` is **not** updated optimistically here — the `subscription.cancelled` webhook is the single source of truth, so a delayed webhook can't leave local/Razorpay state disagreeing.

**Access gate (`canRender` in `billing.service.ts`), called from `handleTriggerRender` in `job.controller.ts`:**
```typescript
// canRender(clerkId): { allowed: boolean; watermark: boolean }
//   subscriptionStatus === 'active' (strict equality, not !== 'cancelled') → { allowed: true, watermark: false }
//   else → countRendersThisMonth(clerkId) < 3 ? { allowed: true, watermark: true } : { allowed: false, watermark: false }
```
Strict `=== 'active'` matters more here than it would have for Stripe: Stripe's `past_due` auto-retries the card behind the scenes (dunning), so treating it as a soft grace period made sense in the original Stripe-shaped draft of this plan. Razorpay's `halted` means Razorpay already gave up retrying after exhausting its own retry schedule — it's a dead end, not a grace period. `halted` falls through to free-tier treatment (watermark + 3/month), matching Razorpay's own semantics rather than fighting them.

**Watermark plumbing:** `canRender`'s `watermark` flag threads through `RenderJobPayload` and into the worker's `inputProps`. No composition reads it yet — building the actual visual watermark across all 11 Remotion compositions is out of scope for this stage; threading the boolean now avoids a second pass through controller → payload → worker later.

**Render-count semantics:** `countRendersThisMonth` counts `Job` docs with `status in ['rendering', 'done']` and `createdAt` in the current calendar month. No separate "render triggered at" timestamp exists on `Job` — using `createdAt` (upload time) as a proxy is good enough for MVP since upload and render-trigger happen close together in practice; a job that sits untouched across a month boundary before its first render would undercount, an acceptable edge case.

---

## Stage 2 — Brand Kit

### Ordering constraint
Stage 1 complete (User model stable; not strictly dependent on billing logic, but sequenced after per user's stage order).

### Files to create

```
src/models/BrandKit.ts                     (Mongoose schema)
src/repositories/brand-kit.repository.ts
src/services/brand-kit.service.ts
src/controllers/brand-kit.controller.ts
app/api/brand-kit/route.ts                 (GET current, PUT upsert)
app/(dashboard)/settings/page.tsx          (settings UI — create/edit brand kit)
components/brand-kit-form.tsx              (client component — color pickers, font select, style select)
```

### Packages

No new packages — reuse existing shadcn components (`input`, `label`, `button`, `card`). If a color picker beyond a plain `<input type="color">` is wanted, `react-colorful` is small and dependency-light — otherwise skip it, native color input is enough for MVP polish.

### Key details

**`BrandKit` model (`src/models/BrandKit.ts`):**
```typescript
userId: string (unique, indexed — one brand kit per user for MVP, not multiple presets)
fontFamily: string | null              // maps to a font available to Remotion compositions — validate against an allowlist, don't accept arbitrary strings
activeColor: string | null             // hex — reuse existing HEX_COLOR zod pattern from job.controller.ts
textColor: string | null
accentColor: string | null
defaultCompositionId: string | null    // one of the existing composition id enum in job.controller.ts
{ timestamps: true }
```

**Reuse, don't duplicate:** `job.controller.ts` already defines `HEX_COLOR` zod regex and a `compositionId` enum (`WordByWord | Karaoke | Fade | Spring | Hype | Hormozi | Minimal | BoxHighlight | Comic | Pill | Script`). Confirmed against `remotion/compositions/` — all 11 files exist (`BoxHighlight.tsx`, `Comic.tsx`, `Fade.tsx`, `Hormozi.tsx`, `Hype.tsx`, `Karaoke.tsx`, `Minimal.tsx`, `Pill.tsx`, `Script.tsx`, `Spring.tsx`, `WordByWord.tsx`, plus `CaptionRoot.tsx`) — this is real, already-shipped state, not aspirational; Phase 1 execution expanded past the 4 originally scoped in `PLAN.md` Stage 6. Extract both into `src/helpers/validators.ts` and import in both `job.controller.ts` and the new `brand-kit.controller.ts` — do not re-declare the enum in two places, it will drift as more compositions get added.

**Font allowlist:** Remotion compositions load fonts via `@remotion/google-fonts` or bundled assets — whatever the existing compositions already use, check `remotion/compositions/*.tsx` for the current font-loading approach before adding a picker that offers fonts the renderer can't actually load. Do not let this become a free-text field.

**Wiring into render (the actual point of this stage):** `handleTriggerRender` in `job.controller.ts` currently accepts `activeColor`/`textColor`/`accentColor` as optional per-request overrides (already there — see existing `triggerRenderSchema`). Extend it: before applying request body values, fetch the user's `BrandKit` and use its fields as defaults, then let any value present in the request body override. Precedence: request body > brand kit > composition's own hardcoded default. This is a one-line merge (`{ ...brandKitDefaults, ...parsedRequestOverrides }`) in `handleTriggerRender`, not a new render path.

**Settings UI:** Simple form, `PUT /api/brand-kit` upserts (findOneAndUpdate with `upsert: true`) — no separate create/edit distinction needed since it's one-per-user.

**Gotcha:** Because `triggerRenderSchema`'s color fields are `.optional()`, an upstream brand-kit merge must distinguish "field absent from request" from "field explicitly cleared" — `zod`'s `.optional()` on a JSON body gives you `undefined` for absent, which is exactly what you want for the merge fallback. Don't accept empty string `""` as a valid override; the existing `HEX_COLOR` regex already rejects it, keep that as-is.

---

## Stage 3 — Batch Upload

### Ordering constraint
Phase 1 Stage 3 (single upload flow) working. Independent of Stages 1–2 — can build in parallel with billing/brand-kit if needed, but sequenced after per user's stage order.

### Files to create

```
src/models/Job.ts                          (extend — add optional batchId field)
src/repositories/job.repository.ts         (extend — findJobsByBatchId, createJob accepts batchId)
src/services/upload.service.ts             (extend — accept array of files, generate shared batchId)
src/controllers/upload.controller.ts       (extend — batch response shape)
app/api/upload/batch/route.ts              (POST — presign N files under one batchId)
app/api/jobs/batch/[batchId]/route.ts      (GET — aggregate status of all jobs in a batch)
components/upload-dropzone.tsx             (extend — multi-file mode)
components/batch-progress.tsx              (client component — "3/5 done" summary)
app/dashboard/jobs/page.tsx                (extend — group by batchId in list view)
```

### Packages

No new packages — `react-dropzone` already supports `multiple: true`, existing `@aws-sdk/s3-request-presigner` handles N presigned URLs the same way as one.

### Key details

**`Job` model addition:**
```typescript
batchId: string | null   // Mongo ObjectId-shaped string, shared across all jobs from one upload session; index it
```
Add index: `JobSchema.index({ batchId: 1 })` — batch status queries filter by this, don't table-scan.

**Batch upload flow:**
```typescript
// POST /api/upload/batch  body: { files: [{ filename, contentType, fileSize }, ...] }
// 1. Validate each file entry with existing uploadSchema (reuse from Stage 3 Phase 1, don't rewrite)
// 2. Generate one batchId (new mongoose.Types.ObjectId().toString())
// 3. For each file: presigned PUT (existing helper) + createJob({ ..., batchId })
// 4. Return { batchId, uploads: [{ jobId, uploadUrl, key }, ...] }
```
Client does N parallel `fetch(uploadUrl, { method: 'PUT' })` calls (existing single-upload logic, just `Promise.all` over the array) — bytes still go direct to R2, unchanged from Phase 1.

**Rate limit interaction:** `countTodayUploads` already counts by `userId` + `createdAt` — a 5-file batch counts as 5 uploads against the daily cap. Check the cap against `todayCount + files.length` **before** creating any Job docs, not per-file mid-batch — otherwise a batch can partially succeed and leave orphaned Job docs when the cap is hit mid-loop.

**Batch status aggregation (`app/api/jobs/batch/[batchId]/route.ts`):**
```typescript
// findJobsByBatchId(batchId) -> verify all jobs.userId === authenticated userId (reject if any mismatch — batchId is guessable-ish, don't trust it alone)
// return { batchId, total, done: count(status==='done'), failed: count(status==='failed'), inProgress: rest }
```

**Dashboard grouping:** `app/dashboard/jobs/page.tsx` already lists jobs flat (per current `findJobsByUserId`). Add a `batchId` grouping pass client-side (or a repository method `findJobsByUserIdGrouped`) — jobs with the same non-null `batchId` render under one `BatchProgress` card instead of N separate rows. Jobs with `batchId: null` (all Phase 1 single-uploads, and any Phase 2 single uploads that skip the batch endpoint) render exactly as they do today — this is additive, not a breaking change to existing list rendering.

**Gotcha:** Each file in a batch still gets its own BullMQ job (Stage 7, Phase 1 concurrency: 1 — VM renders one at a time regardless of batch). A 5-video batch takes 5x as long wall-clock as one video; the UI must communicate this as sequential progress, not imply parallel rendering. Don't oversell "3/5 done" as fast — it's accurate but slow by design (MVP concurrency limit).

---

## Stage 4 — Retry UI

### Ordering constraint
Phase 1 Stage 8 (render pipeline, `retryCount` field, BullMQ automatic retry) working.

### Files to create

```
src/repositories/job.repository.ts         (extend — incrementManualRetryCount, resetForRetry)
src/services/job.service.ts                (extend — retryJob orchestration + cap check)
src/controllers/job.controller.ts          (extend — handleRetryJob)
app/api/jobs/[id]/retry/route.ts           (POST — re-enqueue)
components/job-progress.tsx                (extend — Retry button + human-readable error)
src/helpers/error-messages.ts              (map raw errorMessage strings → user-facing copy)
```

### Packages

No new packages.

### Key details

**Distinguish automatic vs manual retry count.** `IJob.retryCount` currently increments in `updateJobFailed` (Phase 1, `job.repository.ts`) — that's BullMQ's automatic retry (`attempts: 2` per Stage 7 Phase 1). Manual retry from the UI needs its **own** counter so a user mashing "Retry" 3 times doesn't get conflated with the 1 automatic system retry. Add:
```typescript
manualRetryCount: number (default 0)
```
Cap check uses `manualRetryCount`, not `retryCount`.

**Retry service (`job.service.ts`):**
```typescript
// retryJob(jobId, userId):
//   1. verify job.userId === userId
//   2. verify job.status === 'failed'
//   3. if job.manualRetryCount >= 3 -> throw RETRY_CAP_EXCEEDED (controller returns 429)
//   4. increment manualRetryCount
//   5. skip re-transcription if job.transcript or job.transcriptKey already set — re-enqueue straight to render stage
//   6. reset status to 'processing', clear errorMessage
//   7. renderQueue.add(...) — same Promise.race timeout pattern as original enqueue (Phase 1 gotcha #10, still applies here)
```

**Skip re-transcription — this is the actual value of the stage, not just re-running the same job.** `RenderJobPayload` (Phase 1, `src/types/job.types.ts`) already carries `transcriptKey` optionally; if `job.transcript` (inline) or `job.transcriptKey` (R2) is populated, the retry payload should signal the worker to skip the Deepgram call entirely and jump straight to `worker/render.ts`'s render step. Check how `worker/index.ts` currently branches on job stage — if there's no existing "resume from render" entry point, this stage needs to add one (a `skipTranscription: boolean` flag on `RenderJobPayload`, checked in the worker before calling `transcription.service.ts`). If a video failed *during* transcription (before a transcript ever got written), there's nothing to skip — full retry runs Deepgram again, that's expected.

**Human-readable errors (`src/helpers/error-messages.ts`):**
```typescript
// const ERROR_MAP: Record<string, string> = {
//   'Transcription failed:': 'We couldn't transcribe this video. Check that it has clear audio.',
//   'ENOSPC': 'Render failed due to a temporary server issue. Try again.',
//   ... 
// }
// mapErrorMessage(raw: string): string — substring match against ERROR_MAP keys, fallback to generic "Render failed. Try again or contact support."
```
Never show raw stack traces or SDK error objects to users — `job.errorMessage` in Mongo can stay detailed (useful for debugging), the UI-facing string goes through this mapper.

**UI (`components/job-progress.tsx`):** Retry button visible only when `status === 'failed'`. Disable + show "Retry limit reached" once `manualRetryCount >= 3`. On click, `POST /api/jobs/{id}/retry`, then re-subscribe to the existing SSE stream (Phase 1 Stage 9) — no new realtime mechanism needed, the same `/api/jobs/[id]/stream` route already reflects status changes.

**Gotcha:** Resetting `status` to `'processing'` before the BullMQ job actually starts processing creates a brief window where SSE shows "processing" but nothing is queued yet if `queue.add()` fails. Order matters: enqueue first (with the existing timeout-wrapped `Promise.race`), only update status to `'processing'` on enqueue success. Mirrors the existing Phase 1 enqueue route's ordering — don't invert it here.

---

## Stage 5 — Usage Dashboard

### Ordering constraint
Stage 1 complete (billing cycle data exists on User doc, if showing billing-cycle-relative usage). Otherwise independent — pure aggregation over existing Job data.

### Files to create

```
src/repositories/job.repository.ts         (extend — aggregation queries)
src/services/usage.service.ts              (compute usage stats for a user)
src/controllers/usage.controller.ts
app/api/usage/route.ts                     (GET — usage summary for authenticated user)
app/(dashboard)/usage/page.tsx             (usage dashboard page)
components/usage-stats.tsx                 (Card/Badge-based stat display, existing shadcn components)
```

### Packages

No new packages. Existing shadcn `Card`, `Badge`, `Progress` components (already added in Phase 1 Stage 1) cover this — no charting library needed for MVP-level "renders done" / "storage used" numbers. If the user wants actual charts later, revisit then (`recharts` is the shadcn-ecosystem default) — don't add it speculatively now.

### Key details

**Aggregation query (`job.repository.ts` addition):**
```typescript
// getUsageStats(userId):
//   Job.aggregate([
//     { $match: { userId } },
//     { $group: {
//         _id: '$status',
//         count: { $sum: 1 },
//     }}
//   ])
//   -> reduce into { done: n, failed: n, processing: n, pending: n, total: n }
```
Use Mongo aggregation, not `.find()` + JS `.filter()` in the service layer — this is exactly the kind of query that gets slow un-indexed at scale, and `userId` is already indexed (Phase 1 Job model).

**Storage used:** Job doc doesn't currently store file size (Phase 1 `Job` model has no `fileSize` field — the size was only known transiently in the upload validation Zod schema, never persisted). This stage needs to add:
```typescript
// Job.ts addition:
fileSize: number | null   // bytes, set at upload confirm time
```
Backfill isn't needed for MVP — old jobs just show `null`/excluded from the sum, note this as a known gap rather than writing a migration script.

```typescript
// getUsageStats also returns:
// Job.aggregate([{ $match: { userId } }, { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } }])
```

**Billing-cycle-relative usage (optional per CLAUDE.md — "if relevant to plan limits"):** Since MVP pricing is flat/unlimited-within-upload-limits (CLAUDE.md — no per-render metering), billing-cycle usage is informational only, not a gate. If shown, derive cycle start from `User.razorpaySubscriptionId` via a `razorpay.subscriptions.fetch()` call (`current_start`) rather than storing it redundantly in Mongo — Razorpay is the source of truth for billing periods. Skip this sub-feature entirely if it adds more complexity than the "informational only" value justifies; the count/storage stats above are the actual deliverable.

**UI (`app/(dashboard)/usage/page.tsx`):** Server component, same pattern as existing `app/dashboard/page.tsx` — fetch via `connectDB()` + service call directly (no client-side fetch needed, it's not realtime data). `Card` per stat: renders done, renders failed, storage used (human-readable via a `formatBytes` helper in `src/helpers/`), current plan (`subscriptionStatus` from Stage 1). Label the storage stat "Total processed" (not "Storage used") and add a tooltip/caption on that Card explicitly stating it counts all uploads ever, including ones auto-deleted after 7 days — otherwise a user watches the number climb but never drop, notices files are gone after a week, and assumes the dashboard is broken.

**Gotcha:** Don't recompute storage-used by summing `fileSize` across *all* jobs if Phase 1's 7-day auto-delete retention (CLAUDE.md product decision) has already removed the underlying R2 objects for old jobs — the Mongo `fileSize` field persists even after the file is deleted from storage. Either exclude jobs older than 7 days from the storage sum, or clarify in the UI that this reflects "total processed," not "currently stored." Pick "total processed" — it's simpler and matches what a user intuitively wants to see (their usage history), not live storage bytes.

---

## Dependency Order

```
Stage 1 (Razorpay) ─┬── Stage 2 (Brand Kit)
                    │
                    ├── Stage 3 (Batch Upload) ── independent of 1/2, can run parallel
                    │
                    ├── Stage 4 (Retry UI) ── independent of 1/2/3, can run parallel
                    │
                    └── Stage 5 (Usage Dashboard) ── needs Stage 1 only if showing billing-cycle data; otherwise independent
```

Only hard dependency: Stage 1 must land first if `subscriptionStatus` gates anything the other stages touch (it doesn't, directly — Stages 2–5 all read/write Job and BrandKit data, not billing state). Stages 2–5 can be built in any order or in parallel.

---

## Environment Variables Reference (additions to Phase 1's list)

```
# .env.local (Next.js — never commit)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID=
NEXT_PUBLIC_APP_URL=
```

No new worker env vars this phase — worker doesn't touch Razorpay, brand kit, batch, retry, or usage logic directly (all Next-side except retry's re-enqueue, which reuses the existing `RenderJobPayload` shape worker already consumes, and the `watermark` flag which is threaded through but not yet rendered).

---

## Critical Files

| File | Why critical |
|------|-------------|
| `app/api/webhooks/razorpay/route.ts` | Raw-body HMAC verification — a `req.json()` mistake here silently breaks all billing sync |
| `src/models/User.ts` | `subscriptionStatus` gates render access — schema drift here = users locked out or getting free access incorrectly |
| `src/helpers/validators.ts` (extracted `HEX_COLOR` + compositionId enum) | Shared between job trigger-render and brand-kit — must stay single source of truth as composition count grows |
| `src/types/job.types.ts` (`RenderJobPayload`) | Retry's `skipTranscription` flag and batch's `batchId` both extend this — worker and Next must agree on shape |
| `src/repositories/job.repository.ts` | Every stage this phase extends it (batchId, manualRetryCount, fileSize, usage aggregation) — highest collision-risk file if stages are built in parallel |

---

## Cross-Stage Gotchas

1. **Razorpay webhook raw body:** `req.text()` not `req.json()` — signature verification breaks silently otherwise.
2. **Webhook idempotency:** All Razorpay event handlers must be upserts keyed on `razorpaySubscriptionId` — Razorpay can retry/resend events.
3. **`job.repository.ts` contention:** Stages 2–5 all add fields/methods to this file — if built in parallel, expect merge conflicts here specifically. Land Stage 3's `batchId` index and Stage 5's `fileSize` field additions to `Job.ts` in the same PR if possible to avoid two separate schema-touching merges.
4. **Manual vs automatic retry count:** Don't reuse Phase 1's `retryCount` (BullMQ automatic) for the Stage 4 manual retry cap — separate field, separate semantics.
5. **Brand kit color precedence:** request body override > brand kit default > composition hardcoded default — implement as a shallow merge in `handleTriggerRender`, not a new render path.
6. **Batch rate limit:** check `todayCount + files.length` against the cap before creating *any* Job docs in a batch — don't let a batch partially succeed mid-loop.
7. **Storage-used semantics:** Stage 5's usage dashboard shows "total processed" (sum of `fileSize` ever recorded), not "currently stored" — Phase 1's 7-day retention deletes the R2 objects but not the Mongo field.
8. **`proxy.ts` webhook exclusion:** `/api/billing(.*)` gets added to the protected matcher in Stage 1, but `/api/webhooks/razorpay` must NOT be protected — same as the existing Clerk webhook, Razorpay can't present a Clerk session.
9. **`halted` is not a grace period:** unlike Stripe's `past_due` (auto-retries), Razorpay's `halted` fires only after Razorpay exhausts its own retry schedule — `canRender` must check `subscriptionStatus === 'active'` strictly, not `!== 'cancelled'`, or a halted user keeps paid-tier access indefinitely.
