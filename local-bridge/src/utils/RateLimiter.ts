type Bucket = {
  count: number;
  resetAt: number;
};

export class RateLimiter {
  readonly #buckets = new Map<string, Bucket>();
  readonly #windowMs: number;
  readonly #max: number;

  constructor(windowMs: number, max: number) {
    this.#windowMs = windowMs;
    this.#max = max;
  }

  assertAllowed(key: string): void {
    const now = Date.now();
    const existing = this.#buckets.get(key);
    const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + this.#windowMs };
    if (bucket.count >= this.#max) {
      throw new Error("Rate limit local atingido");
    }
    bucket.count += 1;
    this.#buckets.set(key, bucket);
  }
}
