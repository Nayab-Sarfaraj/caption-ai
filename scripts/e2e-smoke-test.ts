#!/usr/bin/env tsx
/**
 * E2E smoke test — exercises the full pipeline locally.
 * Prerequisites: .env.local filled, Mongo/Redis/R2 reachable, worker running.
 * Run: npx tsx scripts/e2e-smoke-test.ts
 */

import 'dotenv/config'
import { readFile } from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const PASS = '✓'
const FAIL = '✗'
const results: { label: string; ok: boolean; detail?: string }[] = []

function check(label: string, ok: boolean, detail?: string) {
  results.push({ label, ok, detail })
  console.log(`${ok ? PASS : FAIL} ${label}${detail ? ` — ${detail}` : ''}`)
}

async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const result = await fn()
    check(label, true)
    return result
  } catch (err) {
    check(label, false, err instanceof Error ? err.message : String(err))
    return null
  }
}

function getS3() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

async function main() {
  console.log('\n=== Caption Generator — E2E Smoke Test ===\n')

  // 1. Mongo
  await step('Connect MongoDB', async () => {
    await mongoose.connect(process.env.MONGO_URI!)
    if (mongoose.connection.readyState !== 1) throw new Error('Not connected')
  })

  // 2. Redis
  await step('Connect Redis', async () => {
    const { getRedis } = await import('../src/lib/redis')
    const redis = getRedis()
    const pong = await redis.ping()
    if (pong !== 'PONG') throw new Error(`Unexpected ping response: ${pong}`)
  })

  // 3. R2 presigned PUT
  const testKey = `smoke-test/${Date.now()}/sample.mp4`
  const presignedPut = await step('Generate presigned PUT URL', async () => {
    const s3 = getS3()
    return getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: testKey,
        ContentType: 'video/mp4',
      }),
      { expiresIn: 300 }
    )
  })

  // 4. Upload sample video
  const samplePath = path.resolve(__dirname, 'fixtures', 'sample-30s.mp4')
  let videoBytes: Buffer | null = null
  await step('Read sample video fixture', async () => {
    videoBytes = await readFile(samplePath)
    if (videoBytes.length < 1000) throw new Error('Fixture too small — likely corrupted')
  })

  if (presignedPut && videoBytes) {
    await step('Upload sample video to R2 via presigned PUT', async () => {
      const res = await fetch(presignedPut, {
        method: 'PUT',
        body: new Uint8Array(videoBytes!),
        headers: { 'Content-Type': 'video/mp4' },
      })
      if (!res.ok) throw new Error(`PUT failed: ${res.status} ${res.statusText}`)
    })
  }

  // 5. Deepgram transcription
  await step('Deepgram transcribe sample URL', async () => {
    const { getTranscriptionProvider } = await import('../src/services/transcription.service')
    const provider = getTranscriptionProvider()
    const s3 = getS3()
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: testKey }),
      { expiresIn: 900 }
    )
    const transcript = await provider.transcribe(url)
    if (!transcript.words.length) throw new Error('Zero words returned')
    check('  → word count', true, `${transcript.words.length} words`)
  })

  // 6. BullMQ enqueue
  await step('Enqueue test job to BullMQ', async () => {
    const { getRenderQueue } = await import('../src/lib/queue')
    const queue = getRenderQueue()
    const job = await Promise.race([
      queue.add('smoke-test', {
        jobId: 'smoke-test-' + Date.now(),
        userId: 'smoke-test-user',
        videoKey: testKey,
        compositionId: 'WordByWord',
        fps: 30,
        outputFormat: 'mp4',
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ])
    if (!job.id) throw new Error('No job ID returned')
    check('  → job ID', true, job.id)
  })

  console.log('\n=== Results ===')
  const failed = results.filter((r) => !r.ok)
  console.log(`Passed: ${results.length - failed.length}/${results.length}`)
  if (failed.length) {
    console.log('\nFailed steps:')
    failed.forEach((r) => console.log(`  ${FAIL} ${r.label}: ${r.detail}`))
    process.exit(1)
  } else {
    console.log('\nAll checks passed.')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err)
  process.exit(1)
})
