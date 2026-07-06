import { S3Client } from '@aws-sdk/client-s3'

declare global {
  // eslint-disable-next-line no-var
  var _s3: S3Client | undefined
}

export function getS3Client(): S3Client {
  if (global._s3) return global._s3

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 environment variables are not set')
  }

  global._s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  return global._s3
}
