import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getS3Client } from '@/src/lib/storage'

export async function generatePresignedPut(
  key: string,
  contentType: string
): Promise<{ url: string }> {
  const client = getS3Client()
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(client, command, { expiresIn: 300 })
  return { url }
}

export async function generatePresignedGet(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getS3Client()
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })
  return getSignedUrl(client, command, { expiresIn })
}
