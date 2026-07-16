# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Project

Caption generator — word-by-word animated captions for uploaded video, rendered via Remotion. Positioning: one flat pricing tier, no credit system, transparent rendering (vs veed.io / captions.ai black-box + credit confusion).

## Stack

- Framework: Next.js (App Router) — frontend + API routes
- UI: Tailwind CSS + shadcn/ui
- Auth: Google OAuth via Clerk
- DB: MongoDB
- Storage: S3-compatible (prefer R2 for egress cost)
- Queue: BullMQ + Redis (Upstash)
- Rendering: Remotion (`@remotion/renderer` + `@remotion/player` for preview)
- Transcription: Deepgram (Nova-3 batch default, hosted Whisper as fallback/config flag)
- Realtime updates: SSE (render/job progress)
- Data fetching: TanStack Query (React Query v5)
- Payments: Polar (merchant of record, Subscriptions API — not Stripe/Razorpay, see Product decisions)
- Analytics: PostHog (`posthog-js` client + `posthog-node` server) — pageviews/autocapture, funnel events (upload → render → checkout → subscribe), session replay

## Architecture

Monorepo, two runtime pieces:

1. **Next.js app** — deployable anywhere (Vercel or the same GCP VM). Handles UI, auth, upload URL generation, job enqueue, SSE progress endpoint. Never touches Remotion directly.
2. **Worker process** — plain Node.js script, runs on GCP VM (pm2/systemd for persistence). Listens to BullMQ queue, does the actual work.

Remotion **compositions** (the React caption components) live in a `remotion/` folder inside this same repo — not a separate app. The worker imports `@remotion/renderer`, bundles that folder, and renders in-process using headless Chromium on the VM. No separate deployment for rendering.

Both Next.js and the worker connect to the same Redis instance — that's the only link between them (no direct API calls between the two).

## Core pipeline

1. User uploads video → presigned URL → object storage
2. If user provides `.srt`/`.vtt` → parse directly, skip transcription
3. Else → enqueue job → worker picks it up → Deepgram Nova-3 batch → word-level timestamped transcript JSON
4. Transcript → Remotion composition (word-by-word, Spring/Fade/Karaoke styles)
5. Worker renders via `@remotion/renderer` → uploads output to storage → deletes local temp file
6. Job status updated → SSE → progress/download link to user

## Conventions

- Ship MVP first: Google login → upload → transcribe → 3–4 caption presets → render → download. No brand kits, no batch, no API yet (Phase 2/3).
- No credit system, no per-feature gating in MVP — flat tier only.
- Keep transcription provider swappable behind one interface (Deepgram Nova-3 / Whisper) — don't hardcode calls inline.
- Caption styles are real Remotion compositions (React components), not config-driven black boxes — this is the differentiator, keep it that way.
- VM needs Chromium system deps installed for Remotion — check their docs for exact apt packages before deploying worker. ffmpeg is NOT required as a system package since Remotion 4.0 — it's bundled and auto-downloaded into node_modules at render time if missing.
- Wrap render steps in try/finally — always clean up temp files on the VM, even on failure.

## Known gotchas (carry over from past projects)

- BullMQ `queue.add()` can hang if Redis is unreachable — always wrap with timeout/error handling.
- Mongoose `Map` fields serialize oddly — use `Schema.Types.Mixed` for transcript field, serialize with `JSON.parse(JSON.stringify(...))` before write.
- Validate all user-facing pickers/selectors server-side, not just client-side.
- **Remotion + React version:** Remotion 4.0.485 requires `react >= 16.8.0` — React 19 is fully compatible. No pinning needed.
- **shadcn toast:** `toast` component removed in shadcn v4+. Use `npx shadcn@latest add sonner` instead.
- **Deepgram SDK method:** `@deepgram/sdk` v5+ changed API. Correct call is `client.listen.v1.media.transcribeUrl({ url, model: 'nova-3', punctuate: true, smart_format: true })` — NOT the old `listen.prerecorded.transcribeUrl` pattern.
- **Job rate-limit query:** `job.repository.ts` needs compound index `{ userId: 1, createdAt: 1 }` on the Job model — without it the daily upload-count query table-scans.
- **SSE route runtime:** always `export const runtime = 'nodejs'` on SSE + webhook routes — ioredis is TCP and silently fails on Vercel Edge Runtime.
- **Polar webhook signature:** verify using `validateEvent(rawBody, headers, webhookSecret)` from `@polar-sh/sdk/webhooks` (Standard Webhooks spec — needs the raw `webhook-id`/`webhook-timestamp`/`webhook-signature` headers, not just the body). Same "don't let Next.js parse the JSON before verifying" trap as Stripe/Razorpay — use `req.text()`, never `req.json()`, in the webhook route.
- **Polar checkout is checkout-first, not subscription-first:** `checkouts.create()` returns a hosted URL before any subscription exists — there's no subscription ID to store locally until the customer actually completes payment. The `subscription.*` webhook (via `customer.externalId`, set to our `clerkId` at checkout creation) is what links and syncs in one step. Don't try to pre-create a "pending" subscription row like a Stripe/Razorpay-shaped flow would.
- **PostHog is optional, never a hard dependency:** `getPostHog()` in `src/lib/posthog.ts` returns `null` if `NEXT_PUBLIC_POSTHOG_KEY` isn't set — always call it as `getPostHog()?.capture(...)`, never assume a client exists. Analytics going down should never break uploads/renders/billing. Server client is a single persistent instance (pm2, not serverless) — deliberately skips the official docs' `flushAt:1`/`shutdown()`-per-call pattern, which is a workaround for short-lived serverless functions this app doesn't have.

## Out of scope for now

- Kubernetes, Terraform, Remotion Lambda (using self-hosted GCP VM instead)
- AI dubbing/translation
- Multi-speaker diarization (revisit only if podcast use case is prioritized)

## Project structure

Layered architecture — controllers/services/repositories pattern, not logic dumped in route files.

```
/app                          → Next.js App Router (routes/pages only, thin)
  /api
    /upload/route.ts           → calls controller, returns response
    /jobs/[id]/route.ts
    /jobs/[id]/stream/route.ts → SSE endpoint
    /webhooks/polar/route.ts    → Polar webhook handler
  /(dashboard)/...             → UI pages
  layout.tsx, page.tsx

/src
  /controllers                 → request/response handling only, calls services
    upload.controller.ts
    job.controller.ts
    billing.controller.ts      → Polar checkout/webhook request handling
  /services                    → business logic, orchestration
    upload.service.ts
    transcription.service.ts   → Deepgram/Whisper abstraction lives here
    job.service.ts
    render.service.ts          → used by worker, not by Next directly
    billing.service.ts         → Polar checkout creation, webhook event handling
  /repositories                → DB access only, no business logic
    user.repository.ts
    job.repository.ts
  /models                      → Mongoose schemas
    User.ts                    → includes polarCustomerId, polarSubscriptionId, subscriptionStatus
    Job.ts
  /lib                         → shared infra clients (singletons)
    mongo.ts
    redis.ts
    storage.ts                → S3/R2 client
    deepgram.ts
    queue.ts                  → BullMQ queue definition (shared with worker)
    polar.ts                   → Polar SDK client singleton
    posthog.ts                  → PostHog server client singleton, returns null if unconfigured
  /helpers                     → pure utility functions (no side effects)
    srt-parser.ts
    validators.ts
    presigned-url.ts
  /types                       → shared TypeScript types/interfaces
    job.types.ts
    transcript.types.ts

/remotion                      → Remotion compositions (React components)
  Root.tsx
  compositions/
    WordByWord.tsx
    Karaoke.tsx
    Fade.tsx

/worker                        → separate Node process, deployed to GCP VM
  index.ts                     → BullMQ consumer entrypoint
  /services                    → can import from /src/services where shared
  render.ts                    → bundle() + renderMedia() logic

/components                    → shared React UI components (shadcn-based)
/config                        → env validation, constants (limits, pricing)
```

**Rules:**

- Controllers never touch the DB or external APIs directly — always through a service.
- Services never import Next.js request/response types — keeps them reusable by the worker too.
- Repositories are the only files that import Mongoose models directly.
- `/lib` clients are singletons (avoid reconnecting per request, especially with Next's serverless functions).
- Worker imports shared logic from `/src` where possible (e.g. `job.repository.ts`, `transcription.service.ts`) instead of duplicating.

## Product decisions

- **Upload limits:** max 10 min duration / 500MB per video. Formats: mp4, mov only for MVP.
- **Storage retention:** auto-delete original + rendered output 7 days after creation (cron/scheduled job). Keep transcript JSON longer for re-render capability.
- **Job retry:** 1 automatic retry on render failure (BullMQ), then mark `failed` and show manual retry button in UI.
- **Concurrency:** 1 render at a time on the VM for MVP (single worker instance). Revisit if queue wait becomes a problem.
- **Content moderation:** none automated in MVP. ToS bans illegal/NSFW content; add a manual report mechanism (email or button). Revisit only if abuse occurs.
- **Rate limiting:** free tier capped at 5 uploads/day (or 3 renders/month if using free-with-watermark model). Paid tier: soft flag for review if >20 uploads/day, no hard block.
- **Pricing:** 3 paid billing cadences, all identical features (unlimited renders within upload limits above, no watermark, all caption styles) — only price/period differs. Weekly $6.99/wk (~$30/mo equivalent, priced high on purpose to nudge toward monthly), Monthly $14.99/mo (anchor plan), Yearly $119/yr (~$9.92/mo, ~34% off monthly). Free tier: watermark + 3 renders/month, no card required, universal regardless of which paid tier someone eventually picks. Single source of truth: `src/helpers/pricing-tiers.ts`.
- **Legal:** template ToS/Privacy Policy at launch (e.g. Termly), swap for real legal review post-revenue.
- **Payments — Polar, not Stripe/Razorpay:** Stripe is invite-only in India with no self-serve signup. Razorpay works but requires business KYC verification before going live, which the team wants to skip for MVP speed. Polar is a merchant of record — it handles global tax (VAT/GST) compliance and pays out to India via Stripe Connect Express (a different product than regular Stripe, not gated the same way), with no KYC step on our side to launch. Tradeoff accepted knowingly: Polar's checkout is card-only (via Stripe) — no UPI, which matters for India-based buyers specifically (Razorpay's UPI support was the original reason Stripe was rejected). Architecturally same shape as the Stripe/Razorpay plans before it (checkout/subscription → webhook → sync `subscriptionStatus` on `User`), just checkout-first instead of subscription-first (see gotcha above) and different SDK/event names. RevenueCat is not used — no mobile app in this project yet.

## Phases

**Phase 1 — MVP**

- Next.js app scaffold, Tailwind + shadcn setup
- Google login (Clerk), Mongo connection
- Upload UI → presigned URL → storage
- Optional `.srt`/`.vtt` upload path
- Deepgram Nova-3 batch integration
- Remotion compositions: 3–4 caption presets (word-by-word hero style)
- BullMQ + Redis queue, worker script running on GCP VM
- SSE progress → download link
- Flat single pricing tier (even if payments aren't wired yet, no credit system in the data model)

**Phase 2 — Payments + polish**

- Payment integration: Polar Subscriptions + webhooks. **Action items:**
  - Create a Polar organization (sandbox first), no business KYC needed to start selling — payouts to India route through Stripe Connect Express once you're ready to go live
  - Create a Product (subscription, monthly billing cycle) in the Polar dashboard, note the Product ID
  - `src/lib/polar.ts` — Polar Node SDK (`@polar-sh/sdk`) client singleton, same pattern as `mongo.ts`/`redis.ts`
  - `User` model: add `polarCustomerId`, `polarSubscriptionId`, `subscriptionStatus` (mirrors Polar's own `Subscription.status`: `'none' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'`)
  - Webhook route `app/api/webhooks/polar/route.ts` — raw body + `validateEvent()` signature verification (see gotcha above), one handler for all `subscription.*` events (Polar always sends the full current subscription object, no per-event switch needed)
  - All webhook handlers must be idempotent upserts keyed on `clerkId` (via `customer.externalId`) — Polar can retry/resend events, and there's no subscription ID to key on until the first webhook arrives
  - Access gate: `canRender(userId)` returns `{ allowed, watermark }` — paid+active → no watermark; free tier under monthly quota → watermark: true; free tier over quota → not allowed. Gate in service layer, not middleware (needs a DB read).
- Brand kit: saved font/color/animation presets per user
- Batch upload (multiple videos per job run)
- Better error handling/retry UI for failed renders
- Basic usage dashboard (renders done, storage used)

**Phase 3 — Differentiator / scale**

- Public API exposing Remotion compositions programmatically
- Multi-worker scaling on VM (or move to multiple VMs) as load grows
- Additional caption styles / customization controls
- Revisit diarization/multi-speaker if podcast use case gains traction

## Environment Variables Reference

```
# .env.local (Next.js — never commit)
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRODUCT_ID_WEEKLY=
POLAR_PRODUCT_ID_MONTHLY=
POLAR_PRODUCT_ID_YEARLY=
POLAR_SERVER=sandbox
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

No new worker env vars for billing — worker doesn't touch Polar directly.

## Commands

<!-- fill in once package.json scripts exist -->
