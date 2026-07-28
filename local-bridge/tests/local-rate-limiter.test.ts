import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter } from "../src/utils/RateLimiter";

describe("RateLimiter", () => {
  it("deve bloquear apos limite local", () => {
    const limiter = new RateLimiter(60_000, 1);
    limiter.assertAllowed("ip");
    assert.throws(() => limiter.assertAllowed("ip"), /Rate limit/);
  });
});
