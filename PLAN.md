# Phase 1 — MVP Implementation Plan

## Preamble and Conventions

Monorepo root: `/Users/nayabsarfaraj/Desktop/captions`. All paths below are relative to that root.

Three structural rules drive every decision:

1. Controllers own request/response shape. Services own business logic. Repositories own DB queries. Nothing crosses lanes.
2. `/src/lib` clients are singleton-initialized — critical for Next.js hot reload and serverless.
3. The worker is a plain Node process. It shares `/src` code with Next but never imports anything from `/app` or Next.js itself.

---

## Stage 1 — Scaffold

### Ordering constraint
None. Foundation for everything.

### Files to create

```
package.json                          (monorepo root — npm workspaces)
.nvmrc                                (pin Node 20 LTS)
.gitignore
tsconfig.base.json                    (shared TS config extended by all workspaces)
app/layout.tsx
app/page.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/page.tsx
next.config.ts
tsconfig.json                         (extends tsconfig.base.json)
tailwind.config.ts
postcss.config.js
components.json                       (shadcn init output)
worker/package.json
worker/tsconfig.json
worker/index.ts                       (stub — fully implemented Stage 7)
remotion/package.json
remotion/tsconfig.json
remotion/Root.tsx                     (stub)
.env.local                            (Next.js vars — never commit)
worker/.env                           (worker vars — never commit)
.env.example                          (committed, no secrets)
```

### Packages

```bash
# create-next-app flags:
npx create-next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir=false \
  --import-alias "@/*" \
  --no-turbopack

# shadcn init:
npx shadcn@latest init
# answers: TypeScript yes, style "default", base color "neutral", CSS vars yes

# shadcn components needed upfront:
npx shadcn@latest add button card progress badge dialog input label sonner
```

### Key details

**`--no-turbopack`** — Remotion bundler and Turbopack have documented conflicts in monorepos.

**`--src-dir=false`** — CLAUDE.md uses `/src` at repo root (not inside `/app`). Next's `app/` sits at root; `/src` is the shared logic layer.

**`tsconfig.base.json`** path aliases — both Next and worker must resolve identically:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/src/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**Directory creation (run once):**

```bash
mkdir -p src/{controllers,services,repositories,models,lib,helpers,types}
mkdir -p app/{api/{upload,jobs},"(dashboard)"}
mkdir -p remotion/compositions
mkdir -p worker
mkdir -p components/ui
mkdir -p config
mkdir -p scripts/fixtures
```

---

## Stage 2 — Auth + DB

### Ordering constraint
Stage 1 complete.

### Files to create

```
src/lib/mongo.ts                     (Mongoose singleton)
src/models/User.ts                   (schema + type)
src/repositories/user.repository.ts
app/layout.tsx                       (wrap with ClerkProvider)
middleware.ts                        (Clerk auth middleware at repo root)
app/(dashboard)/layout.tsx           (server component — redirect if not signed in)
app/sign-in/[[...sign-in]]/page.tsx
app/sign-up/[[...sign-up]]/page.tsx
app/api/webhooks/clerk/route.ts      (user.created sync → Mongo)
config/env.ts                        (zod-validated env schema)
```

### Packages

```bash
@clerk/nextjs     # Clerk SDK for Next.js App Router
mongoose          # v8+ ships own types
zod               # env validation + request validation throughout
svix              # Clerk webhook signature verification
```

### Key details

**Clerk env vars (`.env.local`):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**`middleware.ts` (repo root, not inside `/app`):**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/api/upload(.*)', '/api/jobs(.*)'])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

**Mongoose singleton (`src/lib/mongo.ts`):**

Store connection promise on `global` so it survives Next hot-reload:
```typescript
// declare global { var _mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } }
// if cached.promise → return it
// else: mongoose.connect(env.MONGO_URI, { bufferCommands: false })
// store on global._mongoose
```
`bufferCommands: false` — fail fast when connection isn't up.

**User model (`src/models/User.ts`):**
Fields: `clerkId` (string, unique, indexed), `email` (string, unique), `name` (string), `createdAt` (Date, default now).
Use `clerkId` not `googleId` — Clerk is the auth layer, it handles Google internally.

**Clerk webhook (`app/api/webhooks/clerk/route.ts`):**
Fires `user.created`. Verify `svix-signature`, then upsert User doc via `user.repository.ts`.
Add `export const runtime = 'nodejs'` — webhook needs full Node, not Edge.

**`config/env.ts`** — Zod validates all vars at import time, fails loudly:
```typescript
const schema = z.object({ MONGO_URI: z.string().url(), CLERK_SECRET_KEY: z.string(), ... })
export const env = schema.parse(process.env)
```

**Gotcha:** Clerk v5+ `auth()` is async: `const { userId } = await auth()`. Every protected route handler uses this pattern.

---

## Stage 3 — Upload Flow

### Ordering constraint
Stage 2 complete (auth working, Mongo connected, User model exists).

### Files to create

```
src/lib/storage.ts                        (R2/S3 client singleton)
src/helpers/presigned-url.ts              (generatePresignedPut, generatePresignedGet)
src/helpers/validators.ts                 (file type/size Zod schemas)
src/models/Job.ts                         (Mongoose schema)
src/repositories/job.repository.ts
src/services/upload.service.ts
src/controllers/upload.controller.ts
app/api/upload/route.ts                   (POST — returns presigned URL + jobId)
app/api/jobs/route.ts                     (POST — confirm upload complete, create job)
app/(dashboard)/page.tsx                  (upload UI)
components/upload-dropzone.tsx            (client component)
```

### Packages

```bash
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
@aws-sdk/lib-storage       # multipart upload for rendered output (Stage 8)
react-dropzone
@tanstack/react-query      # v5
```

### Key details

**R2 client (`src/lib/storage.ts`):**
```typescript
// new S3Client({
//   region: 'auto',
//   endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY }
// })
// Singleton: cache on global._s3
```

**Presigned PUT (`src/helpers/presigned-url.ts`):**
```typescript
// PutObjectCommand + getSignedUrl, expiry: 300s
// Key pattern: uploads/{userId}/{jobId}/{sanitized-filename}
// Returns: { url: string, key: string }
```

**Job model (`src/models/Job.ts`):**
```typescript
// Fields:
// userId: string (Clerk userId, indexed)
// videoKey: string
// originalFilename: string
// status: 'pending' | 'processing' | 'transcribing' | 'rendering' | 'done' | 'failed'
// transcriptSource: 'deepgram' | 'user' | null
// transcript: Schema.Types.Mixed | null   // ← Mixed not Map (see gotchas)
// transcriptKey: string | null            // R2 key if transcript stored externally
// outputKey: string | null
// errorMessage: string | null
// retryCount: number (default 0)
// { timestamps: true }                    // auto createdAt + updatedAt
```

**Upload flow (two HTTP calls from client):**

1. `POST /api/upload` — sends `{ filename, contentType, fileSize }`. Validates via Zod. Creates Job doc with `status: 'pending'`. Returns `{ uploadUrl, key, jobId }`.
2. Client does `fetch(uploadUrl, { method: 'PUT', body: file })` — bytes go direct to R2, never through Next.
3. `POST /api/jobs` with `{ jobId }` — confirms upload done. (Deepgram or SRT path triggered in Stage 5.)

**Validation (`src/helpers/validators.ts`):**
```typescript
const uploadSchema = z.object({
  filename: z.string().max(255),
  contentType: z.enum(['video/mp4', 'video/quicktime']),
  fileSize: z.number().max(500 * 1024 * 1024), // 500MB
})
```
Validate server-side. Reinforce in dropzone client-side.

**Rate limit in `upload.service.ts`:**
```typescript
// const todayCount = await job.repository.countTodayUploads(userId)
// if (todayCount >= 5) throw new Error('RATE_LIMIT')
```
Returns HTTP 429 from controller.

**Upload dropzone (`components/upload-dropzone.tsx`):**
`react-dropzone` with `accept: { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'] }`, `maxSize: 500MB`.
Use TanStack Query `useMutation` for each step (presign → PUT → confirm).

**Gotcha:** R2 requires CORS policy allowing `PUT` from your domain. Set in Cloudflare dashboard before testing. Add `Content-Type` to allowed headers or the presigned PUT will fail with a CORS error.

---

## Stage 4 — Optional Caption Upload

### Ordering constraint
Stage 3 complete (Job model exists, upload flow works).

### Files to create

```
src/helpers/srt-parser.ts              (SRT + VTT → internal Transcript format)
src/types/transcript.types.ts          (TranscriptWord, TranscriptSegment, Transcript — LOCK THIS TYPE)
src/services/upload.service.ts         (extend for caption file handling)
app/api/upload/captions/route.ts       (POST — parse SRT/VTT, store on Job doc)
components/upload-dropzone.tsx         (add second optional file input)
```

### Packages

```bash
subtitle    # SRT/VTT parsing — handles edge cases better than custom regex
```

### Key details

**`src/types/transcript.types.ts` — THE CENTRAL CONTRACT:**
```typescript
interface TranscriptWord {
  word: string
  start: number   // seconds (float)
  end: number     // seconds (float)
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
  words: TranscriptWord[]  // flat list for word-by-word rendering
}
```

**Lock this type before Stage 5 begins.** Deepgram adapter and SRT parser both produce this shape. Remotion compositions consume it.

**SRT/VTT parser (`src/helpers/srt-parser.ts`):**
- SRT has block-level timing, no word-level. Map each block to one `TranscriptWord` with `word = full line text`.
- VTT with inline cue tags (`<00:00:01.000>word`) — parse into proper word-level entries.
- Use `subtitle` npm package, not custom regex. SRT uses comma as decimal separator (`00:00:01,500`) — custom regex will break this.

**Caption upload flow:** Parse server-side in the API route (files are small, <100KB). Do NOT store raw SRT in R2. Parse inline → store `Transcript` JSON on Job doc → mark `transcriptSource: 'user'` → skip Deepgram entirely.

**Gotcha:** `WordByWord.tsx` Remotion composition must handle single-word-per-segment gracefully (SRT source) — fall back to segment-level display when word-level granularity is absent.

---

## Stage 5 — Transcription

### Ordering constraint
Stage 4 complete (TranscriptWord type is locked and stable).

### Files to create

```
src/lib/deepgram.ts                        (Deepgram SDK client singleton)
src/services/transcription.service.ts      (provider abstraction — key file)
src/repositories/job.repository.ts         (add updateTranscript method)
worker/services/transcription.ts           (worker calls transcription.service.ts)
```

### Packages

```bash
@deepgram/sdk    # v3+
```

### Key details

**Provider interface (`src/services/transcription.service.ts`):**
```typescript
interface TranscriptionProvider {
  transcribe(audioUrl: string): Promise<Transcript>
}
```

Two implementations:
- `DeepgramProvider` — full implementation
- `WhisperProvider` — stub throwing `new Error('Not implemented')`

Factory reads `env.TRANSCRIPTION_PROVIDER`:
```typescript
export function getTranscriptionProvider(): TranscriptionProvider {
  if (env.TRANSCRIPTION_PROVIDER === 'whisper') return new WhisperProvider()
  return new DeepgramProvider()
}
```

Never call `@deepgram/sdk` anywhere except this service.

**Deepgram call:**
```typescript
// deepgramClient.listen.v1.media.transcribeUrl({   // @deepgram/sdk v5+ API
//   url: presignedGetUrl,                          // generate fresh 15-min expiry presigned GET URL
//   model: 'nova-3',
//   smart_format: true,
//   punctuate: true,
//   diarize: false,
// })
// Response: ListenV1Response — access words via result.results.channels[0].alternatives[0].words
// Map each word → TranscriptWord[]
```

**Transcript storage:** Inline on Job doc if `words.length < 4000`. Else store as `transcripts/{jobId}/transcript.json` in R2, set `job.transcriptKey`. The `updateTranscript` repository method handles both cases.

**Failure handling:** Deepgram errors (bad audio, empty file) are usually unretryable. Set `status: 'failed'`, `errorMessage: 'Transcription failed: <reason>'`. Do NOT throw to BullMQ retry.

**Gotcha:** Deepgram Nova-3 batch blocks until full transcript is ready (30-60s for 10-min video). Call this from the worker only — never from a Next.js API route (serverless timeout).

---

## Stage 6 — Remotion Compositions

### Ordering constraint
Stage 5 complete (Transcript type stable). Compositions can be developed in parallel with Stages 4–5 using hardcoded sample data in Remotion Studio.

### Files to create

```
remotion/Root.tsx
remotion/types.ts                           (duplicate TranscriptWord/Transcript types — see gotcha)
remotion/sample-transcript.ts              (hardcoded sample for Studio dev)
remotion/compositions/WordByWord.tsx        (hero feature — implement fully)
remotion/compositions/Karaoke.tsx
remotion/compositions/Fade.tsx
remotion/compositions/Spring.tsx            (4th style)
components/video-preview.tsx               (client component wrapping @remotion/player)
```

### Packages

```bash
# In remotion/ workspace AND worker/ workspace:
remotion
@remotion/renderer
react@19
react-dom@19

# In app/ workspace:
@remotion/player
```

### Key details

**`remotion/Root.tsx`:**
```typescript
// registerRoot(() => (
//   <>
//     <Composition id="WordByWord" component={WordByWord} fps={30} width={1920} height={1080}
//       defaultProps={{ transcript: sampleTranscript, videoSrc: '' }} ... />
//     <Composition id="Karaoke" ... />
//     <Composition id="Fade" ... />
//     <Composition id="Spring" ... />
//   </>
// ))
```

**`WordByWord.tsx` (hero feature):**
```typescript
// const frame = useCurrentFrame()
// const { fps } = useVideoConfig()
// const currentTime = frame / fps
// const currentWordIndex = transcript.words.findIndex(
//   w => currentTime >= w.start && currentTime < w.end
// )
// Sliding window: show last 3 + current (highlighted) + next 2
// Use @remotion/spring for highlight transition animation
// Render <Video src={videoSrc} /> underneath captions
```

**Type sharing gotcha:** Remotion's bundler runs independently from Next's. Do NOT import from `../src/types/` inside Remotion compositions — bundler path resolution fails. Duplicate the `Transcript`/`TranscriptWord` types in `remotion/types.ts`. Small duplication beats bundler misconfiguration.

**Remotion Studio scripts (`remotion/package.json`):**
```json
{
  "scripts": {
    "studio": "remotion studio Root.tsx",
    "build": "remotion bundle Root.tsx"
  }
}
```

Test all 4 compositions in Studio with sample transcript data before wiring to the worker.

**`durationInFrames` calculation:** `Math.ceil(lastWordEnd * fps) + 30` — the +30 frame buffer prevents the last caption cutting off abruptly.

**`components/video-preview.tsx`:** Client component wrapping `@remotion/player`:
```typescript
// dynamic(() => import('@remotion/player'), { ssr: false })
// or: 'use client' + typeof window !== 'undefined' guard
// Pass compositionId + inputProps: { transcript, videoSrc: presignedGetUrl }
```

**Gotcha:** `@remotion/player` uses ResizeObserver and other browser APIs. Always `ssr: false` in dynamic import or guard with `typeof window !== 'undefined'`. Crashes SSR without this.

---

## Stage 7 — Queue + Worker

### Ordering constraint
Stages 2–5 complete. Worker imports from `src/` — all models, repos, services must exist.

### Files to create

```
src/lib/redis.ts                           (ioredis singleton)
src/lib/queue.ts                           (BullMQ queue definition — shared by Next + worker)
src/types/job.types.ts                     (RenderJobPayload type)
app/api/jobs/[id]/enqueue/route.ts         (POST — enqueue after transcript ready)
worker/index.ts                            (BullMQ consumer — full implementation)
worker/tsconfig.json
worker/package.json
worker/.env
ecosystem.config.js                        (pm2 config for GCP VM)
docs/vm-setup.md                           (GCP VM setup checklist)
```

### Packages

```bash
bullmq
ioredis    # BullMQ requires native Redis protocol — NOT @upstash/redis (HTTP client)
```

### Key details

**ioredis client (`src/lib/redis.ts`):**
```typescript
// new Redis(env.UPSTASH_REDIS_URL, {
//   maxRetriesPerRequest: null,   // REQUIRED by BullMQ
//   enableReadyCheck: false       // REQUIRED by BullMQ
// })
```
Both flags are mandatory. Without them BullMQ throws `ReplyError` on job operations.

**Queue (`src/lib/queue.ts`):**
```typescript
// export const QUEUE_NAME = 'render'
// export const renderQueue = new Queue(QUEUE_NAME, { connection })
```
Both Next API routes and worker import `QUEUE_NAME` from here. Never hardcode the string.

**RenderJobPayload (`src/types/job.types.ts`):**
```typescript
interface RenderJobPayload {
  jobId: string          // Mongo ObjectId as string
  userId: string         // Clerk userId
  videoKey: string       // R2 object key
  transcriptKey?: string // R2 key if transcript stored externally
  compositionId: string  // 'WordByWord' | 'Karaoke' | 'Fade' | 'Spring'
  fps: number            // default 30
  outputFormat: 'mp4'
}
```

**Enqueue route (`app/api/jobs/[id]/enqueue/route.ts`):**
```typescript
// Verify job belongs to authenticated user
// Wrap renderQueue.add() in Promise.race with 10s timeout
// If Redis unreachable → HTTP 503 (do NOT silently succeed)
// On success → update job status to 'processing'
// BullMQ options: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } }
```

**Gotcha from CLAUDE.md:** `queue.add()` hangs if Redis is unreachable. The `Promise.race` timeout is mandatory.

**Worker (`worker/index.ts`):**
```typescript
// new Worker(QUEUE_NAME, processRenderJob, {
//   connection,
//   concurrency: 1,    // MVP: one render at a time
// })
// worker.on('failed', async (job, err) => { /* update Job status in Mongo */ })
```

**pm2 config (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'caption-worker',
    script: './worker/dist/index.js',   // compile to JS, more stable than ts-node in pm2
    env: { NODE_ENV: 'production' },
    max_restarts: 10,
    restart_delay: 3000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```
Compile worker with `tsc` first. Using `ts-node` with pm2 in production is less reliable.

**GCP VM apt packages (`docs/vm-setup.md`):**
```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 \
  libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  lsb-release wget xdg-utils ffmpeg
```
These are shared libs for Remotion's bundled Chromium, not the system Chromium itself.

---

## Stage 8 — Render Pipeline

### Ordering constraint
Stages 6 + 7 complete (Remotion compositions tested in Studio; worker connects to Redis).

### Files to create

```
worker/render.ts                           (processRenderJob — main render logic)
worker/services/storage-download.ts        (download video from R2 to /tmp)
src/services/render.service.ts             (bundle() + renderMedia() abstraction)
src/repositories/job.repository.ts         (add updateStatus, updateOutput methods)
```

### Packages

No new packages. `@remotion/renderer` and `@aws-sdk/lib-storage` already installed.

### Key details

**`worker/render.ts` — full flow:**
```typescript
// async function processRenderJob(job: Job<RenderJobPayload>) {
//   const { jobId, videoKey, transcriptKey, compositionId } = job.data
//   const tmpDir = `/tmp/${jobId}`
//   try {
//     await updateJobStatus(jobId, 'rendering')
//     await downloadFromR2(videoKey, `${tmpDir}/input.mp4`)
//     const transcript = transcriptKey
//       ? await downloadTranscriptFromR2(transcriptKey)
//       : await getTranscriptFromMongo(jobId)
//     const bundleUrl = await getBundle()         // cached across jobs
//     await renderMedia({
//       composition: await selectComposition(bundleUrl, compositionId, { transcript, videoSrc: `file://${tmpDir}/input.mp4` }),
//       serveUrl: bundleUrl,
//       outputLocation: `${tmpDir}/output.mp4`,
//       inputProps: { transcript, videoSrc: `file://${tmpDir}/input.mp4` },
//       onProgress: ({ renderedFrames, totalFrames }) => {
//         redisClient.publish(`job:${jobId}:progress`, JSON.stringify({ renderedFrames, totalFrames }))
//       }
//     })
//     const outputKey = `outputs/${userId}/${jobId}/output.mp4`
//     await uploadToR2MultiPart(`${tmpDir}/output.mp4`, outputKey)  // @aws-sdk/lib-storage
//     await updateJobDone(jobId, outputKey)
//   } catch (err) {
//     await updateJobFailed(jobId, err.message)
//   } finally {
//     await rm(tmpDir, { recursive: true, force: true })  // ALWAYS runs
//   }
// }
```

**Bundle caching in `src/services/render.service.ts`:**
```typescript
// module-level: let bundleCache: string | null = null
// getBundle(): if cached → return; else bundle() → store → return
// bundle() takes 10-30s — caching across job runs is mandatory
```

**`file://` prefix:** Chromium inside Remotion requires `file:///absolute/path` for local files. Pass `videoSrc: \`file://${tmpDir}/input.mp4\`` as input prop.

**Multipart upload:** Use `@aws-sdk/lib-storage` `Upload` class for rendered output (can be hundreds of MB). Single-part `PutObject` is slow and memory-intensive.

**Gotcha (CLAUDE.md):** Mongoose `Map` fields serialize oddly. Job transcript field uses `Schema.Types.Mixed`. Before writing transcript to Mongo: `JSON.parse(JSON.stringify(transcript))` to strip non-serializable fields from Deepgram SDK response objects.

---

## Stage 9 — Progress + Delivery

### Ordering constraint
Stage 8 complete (worker publishes progress to Redis; Job reaches 'done'/'failed').

### Files to create

```
app/api/jobs/[id]/stream/route.ts      (SSE endpoint)
app/api/jobs/[id]/route.ts             (GET — job status + presigned download URL)
src/services/job.service.ts            (getJobStatus, getPresignedDownloadUrl)
src/controllers/job.controller.ts      (handleStream, handleGetJob)
app/(dashboard)/jobs/[id]/page.tsx     (job detail/progress page)
components/job-progress.tsx            (client component — SSE consumer)
components/download-button.tsx         (triggers presigned GET URL)
```

### Key details

**SSE endpoint (`app/api/jobs/[id]/stream/route.ts`):**
```typescript
export const runtime = 'nodejs'  // REQUIRED — ioredis needs Node runtime, not Edge

export async function GET(req, { params }) {
  const { userId } = await auth()
  // verify job belongs to user
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()
  const sendEvent = (data) => writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

  // 1. Subscribe to Redis pub/sub: job:{jobId}:progress → send frame progress
  // 2. Poll Mongo every 2s for terminal status (done/failed)
  // 3. On terminal status → sendEvent(finalEvent) → writer.close()

  return new Response(stream.readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  })
}
```

Use a separate ioredis connection for pub/sub — connections in `SUBSCRIBE` mode cannot execute other commands.

**`components/job-progress.tsx`:**
```typescript
'use client'
// useEffect → const sse = new EventSource(`/api/jobs/${jobId}/stream`)
// sse.onmessage → update local state (progress %, status)
// on 'done' event → queryClient.invalidateQueries(['job', jobId])
// cleanup: sse.close() on unmount
```
Use native `EventSource` API, not TanStack Query. SSE is push-based — TanStack Query is for REST/polling.

**Download URL:** `GET /api/jobs/{id}` returns job metadata + presigned GET URL (1-hour expiry) when `status === 'done'`. Use `GetObjectCommand` + `getSignedUrl`. Never embed in SSE event — fetch separately so URL has fresh expiry.

**Gotcha:** Vercel Edge Runtime does not support ioredis (TCP Redis). Always `export const runtime = 'nodejs'` on the SSE route. Without it, Vercel routes to Edge Runtime and fails at the ioredis import.

---

## Stage 10 — End-to-End Test

### Ordering constraint
All Stages 1–9 complete.

### Files to create

```
scripts/e2e-smoke-test.ts              (CLI smoke test — full pipeline)
scripts/fixtures/sample-30s.mp4        (committed short test video)
docs/vm-setup.md                       (GCP VM setup — already started Stage 7)
```

### Packages

```bash
tsx    # run TypeScript scripts directly
```

### Smoke test steps

```typescript
// 1. Connect Mongo → assert
// 2. Connect Redis → assert
// 3. Generate presigned PUT URL for sample-30s.mp4
// 4. Upload video to R2 via presigned URL
// 5. Create Job doc in Mongo
// 6. Call Deepgram → assert words.length > 0
// 7. Enqueue render job to BullMQ
// 8. Poll job status every 5s (timeout: 5 min)
// 9. On 'done': assert outputKey in Mongo
// 10. Fetch output from R2 → assert valid MP4 (check first 4 bytes === 'ftyp' offset at byte 4)
// 11. Assert /tmp/{jobId} deleted on VM
// 12. Print pass/fail per step
```

**Failure path test:** Upload audio-only file → confirm `status: 'failed'`, meaningful `errorMessage`, no zombie `/tmp` dirs.

### Final checklist before Phase 1 is done

- [ ] Google OAuth login/logout works end-to-end
- [ ] Clerk webhook fires → User doc created in Mongo
- [ ] File picker enforces mp4/mov + 500MB (client + server)
- [ ] Presigned PUT: bytes go to R2, not through Next
- [ ] R2 CORS allows PUT from app domain
- [ ] SRT upload parses to internal Transcript format, job skips Deepgram
- [ ] Deepgram returns word-level timestamps for test video
- [ ] All 4 compositions render in Remotion Studio with sample transcript
- [ ] Worker starts with pm2, picks up job from BullMQ
- [ ] Rendered output uploaded to R2, `/tmp` cleaned up
- [ ] SSE delivers progress to browser in real time
- [ ] Download button produces working presigned GET URL
- [ ] Job reaches `failed` correctly on Deepgram error or render error
- [ ] BullMQ retries once on failure, then sets `status: 'failed'`
- [ ] Rate limit: 6th upload same day returns HTTP 429

---

## Dependency Order

```
Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5
                                              ↓
                              Stage 6 (can start parallel with 4–5, uses sample data)
                                              ↓
                             Stage 7 (needs 2–5 for shared imports)
                                              ↓
                             Stage 8 (needs 6 + 7)
                                              ↓
                             Stage 9 (needs 8)
                                              ↓
                             Stage 10 (needs all)
```

Stage 6 can start as soon as `Transcript` type is locked at end of Stage 4.

---

## Environment Variables Reference

```
# .env.local (Next.js — never commit)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
MONGO_URI=
UPSTASH_REDIS_URL=
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
DEEPGRAM_API_KEY=
TRANSCRIPTION_PROVIDER=deepgram

# worker/.env (never commit)
MONGO_URI=
UPSTASH_REDIS_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
CLOUDFLARE_ACCOUNT_ID=
DEEPGRAM_API_KEY=
TRANSCRIPTION_PROVIDER=deepgram
```

---

## Critical Files

| File | Why critical |
|------|-------------|
| `src/types/transcript.types.ts` | Central contract between all pipeline stages — lock before Stage 5 |
| `src/services/transcription.service.ts` | Deepgram/Whisper swap boundary — never call SDK directly outside here |
| `src/lib/queue.ts` | Shared BullMQ queue — if Next and worker import different definitions, jobs never process |
| `worker/render.ts` | try/finally cleanup + bundle caching — wrong implementation fills VM disk |
| `src/models/Job.ts` | Read/written by Next, worker, SSE endpoint, repositories — schema drift = silent runtime failures |

---

## Cross-Stage Gotchas

1. **Mongoose singleton:** Always `global._mongoose` cache. Without it, dev hot-reloads exhaust Mongo connection limit.
2. **ioredis flags:** `maxRetriesPerRequest: null` + `enableReadyCheck: false` — both required for BullMQ.
3. **Clerk v5 async auth:** `const { userId } = await auth()` — every protected handler.
4. **R2 CORS:** Configure before first upload test. Include `Content-Type` in allowed headers.
5. **Remotion Player SSR:** Always `{ ssr: false }` in dynamic import — crashes SSR otherwise.
6. **Bundle caching:** Cache `bundle()` result at module level in worker — recomputing per job = 10-30s penalty per render.
7. **`file://` prefix:** Remotion's Chromium needs `file:///absolute/path` for local video files.
8. **Transcript Mixed type:** `Schema.Types.Mixed` not `Map` for transcript field. Serialize with `JSON.parse(JSON.stringify(...))` before write.
9. **SSE Node runtime:** `export const runtime = 'nodejs'` on SSE route — ioredis is TCP, fails on Vercel Edge.
10. **BullMQ enqueue timeout:** Wrap `queue.add()` in `Promise.race` with 10s timeout — hangs silently on Redis disconnect.
