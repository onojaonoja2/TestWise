import IORedis from "ioredis"

/**
 * Shared Redis connection factory for BullMQ (producer + worker).
 *
 * Railway notes:
 * - The worker service must use the Redis service's PRIVATE URL
 *   (same Railway environment, no egress).
 * - Vercel (queue producer) must use the Redis PUBLIC URL.
 * - If Railway issues a `rediss://` URL, TLS is enabled automatically.
 *
 * BullMQ requires `maxRetriesPerRequest: null`.
 */
export function getRedisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379"
}

export function createRedisConnection(): IORedis {
  const url = getRedisUrl()
  const isTls = url.startsWith("rediss://")

  return new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    ...(isTls ? { tls: {} } : {}),
  })
}
