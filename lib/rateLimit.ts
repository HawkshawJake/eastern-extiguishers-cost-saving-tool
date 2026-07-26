interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

/** Fixed-window limiter. Returns false once `limit` hits are used inside `windowMs`. */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}
