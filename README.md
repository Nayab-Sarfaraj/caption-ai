<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Instacap-000000?style=for-the-badge&logoColor=white">
  <img alt="Instacap" src="https://img.shields.io/badge/Instacap-ffffff?style=for-the-badge&logoColor=black">
</picture>

**Word-by-word animated captions for your videos**

Flat pricing · No credit system · Captions that are real React components

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Remotion](https://img.shields.io/badge/Remotion_4-blueviolet?style=flat-square)](https://remotion.dev)
[![Deepgram](https://img.shields.io/badge/Deepgram_Nova--3-1a1a2e?style=flat-square)](https://deepgram.com)
[![BullMQ](https://img.shields.io/badge/BullMQ-red?style=flat-square)](https://bullmq.io)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

## What it does

Upload a `.mp4` or `.mov`, choose a caption style, and get back a rendered video with frame-accurate animated captions. Deepgram Nova-3 handles AI transcription with word-level timestamps and multi-language code switching. Or skip AI entirely by uploading your own `.srt` / `.vtt` file. There are 27 implemented caption styles — all real Remotion React components, not config-driven black boxes.

---

## Architecture

> **Interactive diagrams** — open [`docs/architecture.html`](docs/architecture.html) in a browser for a zoomable, pannable version with all three diagrams (Architecture · Job Status Flow · Sequence Diagram).

```mermaid
graph TB
    subgraph Browser["Browser"]
        UI["Upload + style editor"]
        Player["@remotion/player\nLive preview"]
        Progress["Job status polling\nSSE enhancement"]
    end

    subgraph Vercel["Vercel"]
        Next["Next.js app + API routes"]
    end

    subgraph EC2["AWS EC2"]
        Worker["BullMQ worker\nqueue concurrency = 1"]
        Deepgram["Deepgram Nova-3\ntranscription"]
    end

    subgraph Lambda["AWS Remotion Lambda"]
        Renderer["Render Lambda\nframe concurrency configurable"]
        TempS3["Temporary render output"]
    end

    subgraph Data["Managed data services"]
        R2["Cloudflare R2\nsource videos + final MP4s"]
        Mongo[("MongoDB Atlas\nJobs + transcripts + users")]
        Redis[("Upstash Redis\nBullMQ + progress")]
    end

    UI -->|presign / confirm| Next
    UI -->|direct upload| R2
    Next --> Mongo
    Next --> Redis
    Progress --> Next
    Worker -->|dequeue| Redis
    Worker --> Deepgram
    Worker -->|read/write job state| Mongo
    Worker -->|presigned source URL| R2
    Worker -->|render request + poll progress| Renderer
    Renderer --> TempS3
    Worker -->|download result, upload final MP4| R2
    Worker -->|publish progress| Redis
    Next -->|presigned download URL| R2
```

---

## Job Status Flow

```mermaid
stateDiagram-v2
    [*] --> pending : Upload confirmed
    pending --> processing : Job enqueued to BullMQ
    processing --> transcribing : Worker picks up job
    transcribing --> transcript_ready : Deepgram returns words or SRT/VTT provided
    transcript_ready --> rendering : User clicks Export
    rendering --> done : MP4 uploaded to R2
    done --> [*]
    transcribing --> failed : Deepgram error or empty audio
    rendering --> failed : Lambda or render error
    failed --> processing : BullMQ auto-retry x1
    failed --> [*] : Max retries exceeded
```

---

## Core Pipeline — Step by Step

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Next as Next.js on Vercel
    participant R2 as Cloudflare R2
    participant Queue as BullMQ Redis
    participant Worker as EC2 worker
    participant Deepgram
    participant Lambda as Remotion Lambda

    User->>Browser: Drop video and pick caption style
    Browser->>Next: POST /api/upload filename size type
    Next-->>Browser: uploadUrl presigned PUT and jobId
    Note over Browser,R2: Video uploads directly to R2 and bypasses the Vercel file proxy
    Browser->>R2: PUT video bytes direct via XHR with progress events
    Browser->>Next: POST /api/upload/captions optional SRT or VTT
    Browser->>Next: POST /api/jobs jobId to confirm upload
    Next->>Queue: queue.add render payload phase transcribe
    Note over Next: Job status changes to processing
    Queue->>Worker: Job dequeued concurrency 1
    Worker->>Deepgram: transcribeUrl presigned GET, Nova-3 word timestamps
    Deepgram-->>Worker: Word-level timestamps JSON
    Worker->>Worker: Store transcript and update status transcript_ready
    Note over Browser: User opens job detail page
    Browser->>Next: GET /api/jobs/:id
    Next-->>Browser: transcript and video presigned URL
    Browser->>Browser: remotion player renders live preview
    User->>Browser: Pick caption style and click Export
    Browser->>Next: POST /api/jobs/:id/render compositionId
    Next->>Queue: queue.add render payload phase render
    Note over Next: Job status changes to rendering
    Browser->>Next: Poll job status and progress
    Queue->>Worker: Render job dequeued
    Worker->>R2: GET original video via presigned URL
    Worker->>Lambda: renderMediaOnLambda with CaptionRoot props
    loop Until Lambda completes
        Worker->>Lambda: getRenderProgress
        Worker->>Queue: publish progress
    end
    Lambda-->>Worker: temporary S3 output location
    Worker->>R2: Download Lambda output and upload final MP4
    Worker->>Worker: Save output key and status done
    Browser->>Next: GET /api/jobs/:id fresh presigned GET URL
    User->>Browser: Click Download
    Browser->>R2: GET output.mp4 triggers browser save dialog
```

---

## Caption Styles

All 27 styles are Remotion React components in `/remotion/compositions/`. Shared visual settings flow through the `CaptionRoot` dispatcher to both the live preview and the Lambda render; News Bar also accepts its category and headline fields.

<table>
<tr><th>Style</th><th>Description</th></tr>
<tr><td><strong>Word by Word</strong></td><td>Active word highlights and scales up with a spring animation. Sliding window shows ±2–3 surrounding words.</td></tr>
<tr><td><strong>Karaoke</strong></td><td>Current segment on a dark pill. Past words dimmed, current word highlighted — teleprompter style.</td></tr>
<tr><td><strong>Fade</strong></td><td>Full segment text fades in at the start of each block. Clean and minimal.</td></tr>
<tr><td><strong>Spring</strong></td><td>Each word springs upward from below as it enters the visible window.</td></tr>
<tr><td><strong>Hype</strong></td><td>High-energy word-by-word with bold scaling and colour flash.</td></tr>
<tr><td><strong>Hormozi</strong></td><td>Large stacked caps inspired by Alex Hormozi's content style.</td></tr>
<tr><td><strong>Minimal</strong></td><td>Understated single-line captions, no animation noise.</td></tr>
<tr><td><strong>Box Highlight</strong></td><td>Active word gets a filled box behind it.</td></tr>
<tr><td><strong>Comic</strong></td><td>Speech-bubble style with chunky strokes.</td></tr>
<tr><td><strong>Pill</strong></td><td>Active word wrapped in a rounded pill badge.</td></tr>
<tr><td><strong>Script</strong></td><td>Flowing script-font style for lifestyle/vlog content.</td></tr>
<tr><td><strong>Single Word</strong></td><td>One giant active word at a time with punchy scaling.</td></tr>
<tr><td><strong>Neon Glow</strong></td><td>Active word lights up with a neon glow.</td></tr>
<tr><td><strong>Gradient</strong></td><td>Animated gradient-fill caption text.</td></tr>
<tr><td><strong>Highlighter</strong></td><td>Marker swipe appears behind the active word.</td></tr>
<tr><td><strong>Underline</strong></td><td>Animated underline sweeps beneath the active word.</td></tr>
<tr><td><strong>Glide</strong></td><td>Caption words glide into position.</td></tr>
<tr><td><strong>Caption Bar</strong></td><td>Solid caption strip suited to podcast-style clips.</td></tr>
<tr><td><strong>Outline</strong></td><td>Hollow outlined text fills for the active word.</td></tr>
<tr><td><strong>Typewriter</strong></td><td>Complete words reveal in time with speech, with a blinking cursor.</td></tr>
<tr><td><strong>Meme</strong></td><td>Impact-style all-caps captions at the top of the frame.</td></tr>
<tr><td><strong>Pulse</strong></td><td>Active word pulses rhythmically.</td></tr>
<tr><td><strong>Sticker</strong></td><td>Active word pops on a playful sticker label.</td></tr>
<tr><td><strong>Glitch</strong></td><td>RGB split and jitter effect for high-energy edits.</td></tr>
<tr><td><strong>Wave</strong></td><td>Letters bob in a playful wave.</td></tr>
<tr><td><strong>Handwritten</strong></td><td>Marker-style handwritten active-word annotation.</td></tr>
<tr><td><strong>News Bar</strong></td><td>Broadcast lower third with an editable category and headline.</td></tr>
</table>

`CaptionRoot` dispatches all 27 styles via a `style` prop — the `@remotion/player` reference stays stable while you swap styles without remounting.

---

## Project Structure

> Deployment note: this tree describes the current source layout. Production
> runs the Next.js app on Vercel, the BullMQ worker on EC2, and renders through
> AWS Remotion Lambda. The local renderer remains a development fallback only.

```
instacap/
├── app/                              # Next.js App Router — thin route files only
│   ├── api/
│   │   ├── upload/route.ts           # POST — presigned PUT URL + Job creation
│   │   ├── upload/captions/route.ts  # POST — parse SRT/VTT, store transcript
│   │   ├── jobs/route.ts             # POST confirm | GET list
│   │   ├── jobs/[id]/route.ts        # GET status + presigned download URL
│   │   ├── jobs/[id]/enqueue/        # POST — add to BullMQ queue
│   │   ├── jobs/[id]/render/         # POST — trigger render phase
│   │   ├── jobs/[id]/stream/         # GET — SSE progress stream
│   │   ├── billing/subscribe/        # POST — create Polar checkout session
│   │   ├── billing/portal/           # POST — Polar customer portal URL
│   │   ├── webhooks/clerk/           # Clerk user.created → MongoDB sync
│   │   └── webhooks/polar/           # Polar subscription.* events → sync User doc
│   ├── dashboard/                    # Upload UI + job grid
│   ├── dashboard/jobs/[id]/          # Job detail, preview, download
│   ├── dashboard/billing/            # Subscription status + upgrade UI
│   ├── dashboard/usage/              # Render usage this month
│   ├── page.tsx                      # Public landing page (SEO, pricing, style showcase)
│   ├── icon.tsx                      # Dynamic favicon
│   ├── opengraph-image.tsx           # OG image
│   ├── sitemap.ts                    # Auto-generated sitemap
│   └── robots.ts                     # robots.txt
│
├── src/                              # Shared logic (Next.js + worker both import this)
│   ├── controllers/                  # Request/response only — delegates to services
│   ├── services/
│   │   ├── upload.service.ts
│   │   ├── transcription.service.ts  # Deepgram/Whisper abstraction
│   │   ├── render.service.ts         # Local-render fallback bundle cache
│   │   ├── job.service.ts
│   │   └── billing.service.ts        # Polar checkout, webhooks, canRender gate
│   ├── repositories/                 # DB access only — no business logic
│   ├── models/                       # Mongoose schemas (Job, User)
│   ├── lib/
│   │   ├── mongo.ts                  # Mongoose singleton
│   │   ├── redis.ts                  # ioredis singleton + pub/sub factory
│   │   ├── queue.ts                  # BullMQ queue definition
│   │   ├── storage.ts                # R2/S3 client singleton
│   │   ├── polar.ts                  # Polar SDK singleton
│   │   └── posthog.ts                # PostHog server-side singleton
│   ├── helpers/
│   │   ├── presigned-url.ts
│   │   ├── srt-parser.ts
│   │   ├── validators.ts
│   │   └── pricing-tiers.ts          # Single source of truth for pricing (landing, paywall, billing page)
│   └── types/                        # Shared TS types (Transcript, RenderJobPayload)
│
├── remotion/                         # Remotion compositions
│   ├── Root.tsx                      # registerRoot — Studio entries for all 27 styles
│   ├── types.ts                      # Transcript types (duplicated — bundler isolation)
│   └── compositions/
│       ├── CaptionRoot.tsx           # Style-switching dispatcher (used by preview + worker)
│       ├── WordByWord.tsx
│       ├── Karaoke.tsx
│       ├── Fade.tsx
│       ├── Spring.tsx
│       ├── Hype.tsx
│       ├── Hormozi.tsx
│       ├── Minimal.tsx
│       ├── BoxHighlight.tsx
│       ├── Comic.tsx
│       ├── Pill.tsx
│       └── Script.tsx
│       ├── ...                        # 15 more styles; see Caption Styles above
│
├── worker/                           # Separate Node process — EC2 queue consumer
│   ├── index.ts                      # BullMQ Worker, SIGTERM graceful shutdown
│   └── render.ts                     # Two-phase: transcribe → transcript_ready → render → done
│
├── components/                       # Shared React UI
│   ├── upload-dropzone.tsx           # Video + SRT/VTT drop, style picker, upload flow
│   ├── preview-player-wrapper.tsx    # dynamic() ssr:false wrapper
│   ├── preview-player.tsx            # @remotion/player + style switcher + export
│   ├── job-progress.tsx              # Polling baseline + SSE-enhanced progress UI
│   ├── download-button.tsx           # Fetches fresh presigned GET, browser download
│   ├── billing-actions.tsx           # Subscribe / cancel / portal buttons
│   ├── paywall-modal.tsx             # Shown when free render cap is hit
│   ├── posthog-identify.tsx          # Links Clerk userId to PostHog person on mount
│   ├── scroll-to-hash.tsx            # Smooth scroll for landing page anchor links
│   └── sidebar.tsx                   # Desktop nav + Clerk UserButton + plan badge
│
├── instrumentation-client.ts         # PostHog browser SDK init (Next.js instrumentation)
├── config/env.ts                     # Zod-validated env — fails loudly at startup
├── docs/deployment.md                # Current Vercel + EC2 + Lambda deployment guide
├── docs/vm-setup.md                  # Former GCP deployment reference only
├── docker-compose.yml                # Local MongoDB + Redis
├── ecosystem.config.js               # PM2 config for caption-worker
└── proxy.ts                          # Clerk auth middleware (repo root)
```

---

## Data Types

The `Transcript` type is the **central contract** that locks every pipeline stage together. The Deepgram adapter, SRT parser, and all Remotion caption compositions consume this exact shape.

```typescript
// src/types/transcript.types.ts
interface TranscriptWord {
  word: string
  start: number       // seconds (float)
  end: number         // seconds (float)
  confidence?: number
}

interface TranscriptSegment {
  text: string
  start: number
  end: number
  words: TranscriptWord[]
}

interface Transcript {
  source: 'deepgram' | 'user'
  language?: string
  segments: TranscriptSegment[]
  words: TranscriptWord[]   // flat list — primary input for word-by-word rendering
}
```

```typescript
// src/types/job.types.ts
interface RenderJobPayload {
  jobId: string
  userId: string
  videoKey: string
  transcriptKey?: string        // R2 key for large transcripts stored externally
  compositionId: CompositionId // one of the 27 supported caption style IDs
  fps: number
  outputFormat: 'mp4'
  phase: 'transcribe' | 'render'
  // Style customisation — passed through to CaptionRoot inputProps
  activeColor?: string          // colour of the highlighted/active word
  textColor?: string            // base word colour
  accentColor?: string          // secondary accent used by some styles
  fontFamily?: string           // override font (CSS font-family string)
  watermark?: boolean           // true on free-tier renders
}
```

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in all values.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (`whsec_...`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `UPSTASH_REDIS_URL` | Upstash Redis URL (`rediss://...`) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (for R2 endpoint) |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | R2 bucket name |
| `DEEPGRAM_API_KEY` | Deepgram API key |
| `TRANSCRIPTION_PROVIDER` | `deepgram` (default) or `whisper` (stub) |
| `POLAR_ACCESS_TOKEN` | Polar API access token |
| `POLAR_WEBHOOK_SECRET` | Polar webhook signing secret |
| `POLAR_PRODUCT_ID_WEEKLY` | Polar product ID for the weekly plan |
| `POLAR_PRODUCT_ID_MONTHLY` | Polar product ID for the monthly plan |
| `POLAR_PRODUCT_ID_YEARLY` | Polar product ID for the yearly plan |
| `POLAR_SERVER` | `sandbox` (default) or `production` |
| `NEXT_PUBLIC_APP_URL` | Full app URL, e.g. `https://instacap.com` (used for Polar redirect) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (`phc_...`) — optional, analytics disabled if absent |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host, defaults to `https://us.i.posthog.com` |

`GROQ_API_KEY` is optional and server-only; it enables News Bar headline
suggestions. Do not use a `NEXT_PUBLIC_` prefix for it.

For Remotion Lambda rendering, add `REMOTION_LAMBDA_FUNCTION_NAME`,
`REMOTION_LAMBDA_SERVE_URL` (the `serveUrl` returned by site deployment),
`REMOTION_AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` to
`worker/.env`. Set `REMOTION_LAMBDA_CONCURRENCY=6` as the current conservative
default. Omit the function name only to use local Remotion rendering during
development.

> **Worker** reads from `worker/.env` — same variable names, no `NEXT_PUBLIC_*` vars needed.

> **R2 CORS** — configure a CORS policy on the R2 bucket allowing `PUT` and `Content-Type` from your app domain before presigned uploads will work.

> **Polar setup** — create three separate Products in Polar (Weekly / Monthly / Yearly), copy their IDs into env. Set `POLAR_SERVER=sandbox` for local testing, `production` when live.

---

## Local Development

### Prerequisites

- Node.js 20 LTS
- Docker (for MongoDB + Redis)

### Setup

```bash
# Install dependencies
npm install

# Start local MongoDB (port 27017) and Redis (port 6379)
docker-compose up -d

# Copy and fill in env vars
cp .env.example .env.local

# Start Next.js
npm run dev

# Start worker in a separate terminal
npm run worker:dev
```

### Remotion Studio

Develop and preview caption compositions in isolation with sample data:

```bash
npm run remotion:studio
```

All caption compositions load with a hardcoded sample transcript. Use this to tune animation timing and style before connecting to real data.

---

## Production Deployment

The current production target is Vercel for the Next.js web app, EC2 for the
BullMQ worker, AWS Remotion Lambda for rendering, and Cloudflare R2 for
permanent storage. Follow the complete guide in
[`docs/deployment.md`](docs/deployment.md).

`docs/vm-setup.md` is retained only as a reference for the former single-GCP-VM
deployment.

Quick worker update summary:

```
1. Deploy the Remotion function and site in AWS `us-east-1`.
2. Deploy the Next.js app to Vercel.
3. Create `worker/.env` on EC2 with shared backend and Lambda variables.
4. Run `npm ci && npm run worker:build`.
5. Start the worker with `pm2 start ecosystem.config.js && pm2 save`.
```

**Deploying worker changes:**

```bash
git pull
npm ci
npm run worker:build
pm2 restart caption-worker --update-env
```

For any change under `remotion/`, redeploy the Remotion site as well:

```bash
npx remotion lambda sites create remotion/Root.tsx --site-name=caption-ai
```

**Disk cleanup** (if a crashed job left zombie `/tmp` dirs):

```bash
find /tmp -maxdepth 1 -name '[0-9a-f]*' -type d -mmin +60 -exec rm -rf {} +
```

---

## Key Implementation Notes

<details>
<summary><strong>Presigned uploads — why video never touches Next.js</strong></summary>

`POST /api/upload` returns a short-lived presigned S3 PUT URL. The client uploads video bytes directly to R2 using `XMLHttpRequest` (not `fetch`, so we get upload progress events). Next.js never proxies the file body — keeping serverless function memory usage at near zero regardless of file size.

</details>

<details>
<summary><strong>Remotion deployment and local fallback</strong></summary>

**Current production:** the worker uses the deployed Remotion site and AWS
Remotion Lambda. The legacy local-renderer note below is not the production
render path.

`worker/render.ts` sends `CaptionRoot` props to the deployed Remotion site and
uses `renderMediaOnLambda`, `getRenderProgress`, and `downloadMedia`. Lambda's
temporary S3 result is copied back to Cloudflare R2 as the permanent output.
Redeploy the Remotion site after every change under `remotion/`.

</details>

<details>
<summary><strong>Transcript storage strategy</strong></summary>

Transcripts are currently stored inline on the Job document as a
`Schema.Types.Mixed` field (not `Map`). `transcriptKey` remains available on the
job payload for a future external-transcript strategy, but it is not the normal
current storage path. Transcript data is JSON-serialized before persistence.

</details>

<details>
<summary><strong>SSE + dedicated Redis pub/sub connection</strong></summary>

The SSE route opens a **separate** ioredis connection in `SUBSCRIBE` mode via `createRedisSub()`. Connections in subscribe mode cannot execute other Redis commands, so this must be isolated from the main singleton. The route also polls MongoDB every 2 seconds for terminal status (`done` / `failed`) and closes the stream when reached, with a hard 10-minute timeout as a safety net.

</details>

<details>
<summary><strong>Worker and Lambda concurrency</strong></summary>

**Current production:** the EC2 BullMQ worker consumes one queue job at a time,
then asks Remotion Lambda to render frames at the configured
`REMOTION_LAMBDA_CONCURRENCY` (default: 6). The historical VM note below does
not describe the production renderer.

The worker runs at `concurrency: 1` — one queue job at a time. Lambda frame
concurrency is controlled independently with `REMOTION_LAMBDA_CONCURRENCY`
(default: 6). Increase it only after checking the AWS account quota and testing
real render reliability.

</details>

<details>
<summary><strong>SRT parsing fallback</strong></summary>

SRT files have block-level timing only — no word-level timestamps. Each block is mapped to a single `TranscriptWord` where `word = full line text`. The `WordByWord` and `Karaoke` compositions handle this gracefully — when a "word" spans multiple seconds, the highlight stays on it for the full duration.

</details>

<details>
<summary><strong>Clerk middleware placement</strong></summary>

`proxy.ts` lives at the **repo root**, not inside `/app`. This is required by Next.js — middleware must be at the root or `src/` level to run before the App Router. All SSE and webhook routes export `export const runtime = 'nodejs'` to prevent Vercel from routing them to the Edge Runtime (ioredis requires TCP, not HTTP, and fails silently on Edge).

</details>

<details>
<summary><strong>Polar billing — why no local payment state</strong></summary>

Polar's checkout is hosted — there's no subscription to reference locally until the customer completes payment. `createCheckout()` sets `externalCustomerId: clerkId` so Polar's `subscription.*` webhook can map back to the right user without any intermediate state. The app never stores card numbers, invoice amounts, or payment methods — all of that lives in Polar. `cancelAtPeriodEnd: true` is used for cancellations so the user keeps paid access through their current cycle; the local `subscriptionStatus` is only updated when Polar fires the next webhook confirming the period actually ended.

</details>

<details>
<summary><strong>PostHog — server-side vs client-side</strong></summary>

Two separate PostHog integrations run in parallel. The browser SDK (`instrumentation-client.ts`) is initialised via Next.js instrumentation and routes through `/ingest/*` (a rewrite in `next.config.ts`) rather than directly to `i.posthog.com` — this keeps requests on the same origin so ad-blockers (Brave, uBlock) don't drop them. The server-side SDK (`src/lib/posthog.ts`) captures backend events like `checkout_started` and `subscription_active` using the same Clerk `userId` as the `distinctId`, so both sides merge into one person in PostHog. The server client is optional — if `NEXT_PUBLIC_POSTHOG_KEY` is not set, `getPostHog()` returns `null` and all capture calls are no-ops.

</details>

<details>
<summary><strong>Render customisation props</strong></summary>

Style-specific props (`activeColor`, `textColor`, `accentColor`, `fontFamily`, `watermark`) are passed through `RenderJobPayload` to the worker and forwarded as `inputProps` to `CaptionRoot`. This is the same component the live preview uses — wiring props through `CaptionRoot` rather than selecting composition styles directly means the worker and preview cannot silently diverge on which props each receives.

</details>

<details>
<summary><strong>Render performance — CRF and concurrency</strong></summary>

Production renders run on AWS Remotion Lambda. The worker preserves source
resolution, reads source frame timing, and caps high-frame-rate input at 30 fps
to limit render work; lower frame rates are preserved. The local renderer is a
development fallback only and caps CPU concurrency at 4 to protect the host.

</details>

---

## Tech Stack

| | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server components, API routes, streaming |
| **UI** | Tailwind CSS v4 + shadcn/ui | Utility-first, accessible primitives |
| **Auth** | Clerk | Google OAuth, webhooks, middleware in one |
| **Database** | MongoDB + Mongoose | Flexible schema for transcript Mixed field |
| **Storage** | Cloudflare R2 | S3-compatible, zero egress fees |
| **Queue** | BullMQ + Upstash Redis | Reliable job queue, pub/sub for SSE |
| **Transcription** | Deepgram Nova-3 | Word-level timestamps and multi-language code switching |
| **Rendering** | AWS Remotion Lambda | Serverless React-based video rendering |
| **Preview** | `@remotion/player` | Real-time in-browser composition preview |
| **Billing** | Polar | Subscription checkout, webhooks, customer portal |
| **Analytics** | PostHog | Event capture, session replay, funnel analysis |
| **Data fetching** | TanStack Query v5 | Mutations for upload flow |
| **Validation** | Zod | Request validation + env schema |
| **Worker runtime** | Node.js + pm2 on EC2 | Long-running queue consumer and Lambda orchestrator |

---

## Pricing

| Plan | Price | Renders | Watermark |
|---|---|---|---|
| Free | $0 | 3 / month | Yes |
| Weekly | $6.99 / week | Unlimited | No |
| Monthly | $14.99 / month | Unlimited | No |
| Yearly | $119 / year (~$9.92/mo) | Unlimited | No |

Free-tier renders are watermarked. A paywall modal is shown when the monthly cap is hit. `bonusRenders` field on the User doc lets you manually grant extra free renders (beta testers, support gestures) without touching billing.

Billing is handled entirely by **Polar** — checkout sessions, subscription lifecycle, and the customer portal (invoices + payment method management) are all Polar-hosted. The app receives `subscription.*` webhooks and syncs `polarSubscriptionId`, `subscriptionStatus`, and `billingTier` onto the User document. No payment data is stored locally.

---

## Product Limits

| Constraint | Value |
|---|---|
| Max file size | 500 MB |
| Accepted formats | MP4, MOV |
| Daily uploads (free tier) | 5 per user |
| Free renders per month | 3 (+ any bonus renders granted) |
| Queue-worker concurrency | 1 per EC2 worker (Lambda frame concurrency is configurable) |
| BullMQ retry on failure | 1 automatic retry |
| SSE stream max duration | 10 minutes |

---

## Scripts

```bash
npm run dev              # Next.js development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint
npm run worker:dev       # Worker with tsx + .env.local (development)
npm run worker:build     # Compile the worker for EC2 / PM2
npm run remotion:studio  # Remotion Studio for composition development
```

---

## Roadmap

**Shipped (Phase 2)**
- Polar billing — Weekly / Monthly / Yearly subscriptions, customer portal
- Watermarked free-tier renders with paywall modal
- 27 caption styles (up from 4)
- PostHog analytics (browser + server-side)
- Landing page with pricing, style showcase, SEO metadata

**Up next (Phase 3)**
- Brand kit — saved colour / font / animation presets per user
- Batch upload (multiple videos per job)
- Improved retry UI for failed renders
- Public REST API exposing Remotion compositions programmatically
- Multi-worker scaling (multiple VM instances)
- Multi-speaker diarization (podcast use case)
