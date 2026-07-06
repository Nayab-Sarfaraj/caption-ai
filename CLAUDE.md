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
- VM needs ffmpeg + Chromium system deps installed for Remotion — check their docs for exact apt packages before deploying worker.
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
  /(dashboard)/...             → UI pages
  layout.tsx, page.tsx

/src
  /controllers                 → request/response handling only, calls services
    upload.controller.ts
    job.controller.ts
  /services                    → business logic, orchestration
    upload.service.ts
    transcription.service.ts   → Deepgram/Whisper abstraction lives here
    job.service.ts
    render.service.ts          → used by worker, not by Next directly
  /repositories                → DB access only, no business logic
    user.repository.ts
    job.repository.ts
  /models                      → Mongoose schemas
    User.ts
    Job.ts
  /lib                         → shared infra clients (singletons)
    mongo.ts
    redis.ts
    storage.ts                → S3/R2 client
    deepgram.ts
    queue.ts                  → BullMQ queue definition (shared with worker)
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
- **Pricing:** target $12–15/month flat, unlimited renders within upload limits above. Free tier: watermark + 3 renders/month, no card required.
- **Legal:** template ToS/Privacy Policy at launch (e.g. Termly), swap for real legal review post-revenue.

## Phases

**Phase 1 — MVP**
- Next.js app scaffold, Tailwind + shadcn setup
- Google login (NextAuth), Mongo connection
- Upload UI → presigned URL → storage
- Optional `.srt`/`.vtt` upload path
- Deepgram Nova-3 batch integration
- Remotion compositions: 3–4 caption presets (word-by-word hero style)
- BullMQ + Redis queue, worker script running on GCP VM
- SSE progress → download link
- Flat single pricing tier (even if payments aren't wired yet, no credit system in the data model)

**Phase 2 — Payments + polish**
- Payment integration: Stripe Checkout + webhooks (direct — no RevenueCat; not needed until/unless a mobile app version ships and cross-platform entitlement sync becomes relevant). **Action item: create a separate Stripe account for this project — existing RevenueCat/Play Store setup from PixlAI does not apply here.**
- Brand kit: saved font/color/animation presets per user
- Batch upload (multiple videos per job run)
- Better error handling/retry UI for failed renders
- Basic usage dashboard (renders done, storage used)

**Phase 3 — Differentiator / scale**
- Public API exposing Remotion compositions programmatically
- Multi-worker scaling on VM (or move to multiple VMs) as load grows
- Additional caption styles / customization controls
- Revisit diarization/multi-speaker if podcast use case gains traction

## Commands

<!-- fill in once package.json scripts exist -->