import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getS3Client } from '@/src/lib/storage'

const presignedGetCache = new Map<string, { url: string; expiresAt: number }>()

export async function generatePresignedPut(
  key: string,
  contentType: string
): Promise<{ url: string }> {
  const client = getS3Client()
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    CacheControl: 'private, max-age=31536000, immutable',
  })
  const url = await getSignedUrl(client, command, { expiresIn: 300 })
  return { url }
}

export async function generatePresignedGet(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const now = Date.now()
  const cached = presignedGetCache.get(key)
  // Reuse existing presigned URL if it still has at least 5 minutes of validity
  // This ensures the browser receives an identical URL and hits HTTP disk cache
  if (cached && cached.expiresAt > now + 300_000) {
    return cached.url
  }

  const client = getS3Client()
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ResponseCacheControl: 'private, max-age=86400, immutable',
  })
  const url = await getSignedUrl(client, command, { expiresIn })
  presignedGetCache.set(key, { url, expiresAt: now + expiresIn * 1000 })
  return url
}
