import Redis from 'ioredis'
import type { ConnectionOptions } from 'bullmq'

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined
}

function getRedisUrl(): string {
  const url = process.env.UPSTASH_REDIS_URL
  if (!url) throw new Error('UPSTASH_REDIS_URL is not set')
  return url
}

// Plain connection options for BullMQ — avoids ioredis version mismatch between
// the top-level ioredis and BullMQ's bundled copy of ioredis.
export function getRedisBullMQOptions(): ConnectionOptions {
  return { url: getRedisUrl() } as ConnectionOptions
}

// ioredis instance for pub/sub (SSE stream) and other direct Redis use
export function getRedis(): Redis {
  if (global._redis) return global._redis

  global._redis = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: getRedisUrl().startsWith('rediss://') ? {} : undefined,
  })

  global._redis.on('error', (err: Error) => {
    console.error('[redis] connection error:', err.message)
  })

  return global._redis
}

// Separate pub/sub connection — SUBSCRIBE mode connections cannot run other commands
export function createRedisSub(): Redis {
  return new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: getRedisUrl().startsWith('rediss://') ? {} : undefined,
  })
}
