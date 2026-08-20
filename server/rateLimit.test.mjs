import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, createRateLimiter, limiterConfigFromEnv } from "./rateLimit.mjs";

// A public, free app with an unmetered model endpoint is a billing incident
// waiting to happen (docs/15-quality-and-testing.md). This pins the guard.

let clock = 1000000;
const now = () => clock;

function limiter(over = {}) {
  return createRateLimiter({ limit: 3, globalLimit: 10, windowMs: 1000, now, ...over });
}

beforeEach(() => {
  clock = 1000000;
});

describe("per-client limit", () => {
  it("allows requests up to the limit", () => {
    const rl = limiter();
    for (let i = 0; i < 3; i++) expect(rl.check("a").allowed).toBe(true);
  });

  it("blocks the request after the limit and reports the scope", () => {
    const rl = limiter();
    for (let i = 0; i < 3; i++) rl.check("a");
    const result = rl.check("a");
    expect(result.allowed).toBe(false);
    expect(result.scope).toBe("client");
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(1000);
  });

  it("tracks clients independently", () => {
    const rl = limiter();
    for (let i = 0; i < 3; i++) rl.check("a");
    expect(rl.check("a").allowed).toBe(false);
    expect(rl.check("b").allowed).toBe(true);
  });

  it("lets a blocked client through once the window rolls over", () => {
    const rl = limiter();
    for (let i = 0; i < 3; i++) rl.check("a");
    expect(rl.check("a").allowed).toBe(false);
    clock += 1001;
    expect(rl.check("a").allowed).toBe(true);
  });
});

describe("global limit", () => {
  it("blocks once the total across clients is exhausted", () => {
    const rl = createRateLimiter({ limit: 100, globalLimit: 5, windowMs: 1000, now });
    for (let i = 0; i < 5; i++) expect(rl.check(`client-${i}`).allowed).toBe(true);
    const result = rl.check("client-new");
    expect(result.allowed).toBe(false);
    expect(result.scope).toBe("global");
  });

  it("does not allocate a counter for a client the global limit rejected", () => {
    // Otherwise a distributed caller could grow the Map one entry per source
    // address while every request is being refused anyway.
    const rl = createRateLimiter({ limit: 3, globalLimit: 2, windowMs: 1000, now });
    rl.check("a");
    rl.check("b");
    const sizeBefore = rl.size();
    expect(rl.check("c").scope).toBe("global");
    expect(rl.size()).toBe(sizeBefore);
  });

  it("recovers for everyone once the global window rolls over", () => {
    const rl = createRateLimiter({ limit: 3, globalLimit: 2, windowMs: 1000, now });
    rl.check("a");
    rl.check("b");
    expect(rl.check("c").allowed).toBe(false);
    clock += 1001;
    expect(rl.check("c").allowed).toBe(true);
  });
});

describe("pruning", () => {
  it("drops expired windows", () => {
    const rl = limiter();
    rl.check("a");
    rl.check("b");
    expect(rl.size()).toBeGreaterThan(0);
    clock += 5000;
    rl.prune();
    expect(rl.size()).toBe(0);
  });
});

describe("clientKey", () => {
  it("prefers the first x-forwarded-for entry", () => {
    expect(clientKey({ headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" } })).toBe("203.0.113.7");
  });

  it("falls back to the socket address", () => {
    expect(clientKey({ headers: {}, socket: { remoteAddress: "198.51.100.4" } })).toBe("198.51.100.4");
  });

  it("never returns an empty key", () => {
    expect(clientKey({ headers: { "x-forwarded-for": "" } })).toBe("unknown");
    expect(clientKey({ headers: {}, socket: {} })).toBe("unknown");
    expect(clientKey({})).toBe("unknown");
  });
});

describe("limiterConfigFromEnv", () => {
  it("uses defaults when unset", () => {
    expect(limiterConfigFromEnv({})).toEqual({ limit: 40, globalLimit: 600, windowMs: 600000 });
  });

  it("reads overrides", () => {
    expect(
      limiterConfigFromEnv({
        CHAT_RATE_LIMIT: "5",
        CHAT_RATE_GLOBAL_LIMIT: "50",
        CHAT_RATE_WINDOW_MS: "1000",
      })
    ).toEqual({ limit: 5, globalLimit: 50, windowMs: 1000 });
  });

  it("ignores junk and non-positive values", () => {
    expect(limiterConfigFromEnv({ CHAT_RATE_LIMIT: "abc", CHAT_RATE_GLOBAL_LIMIT: "0" })).toEqual({
      limit: 40,
      globalLimit: 600,
      windowMs: 600000,
    });
  });
});
