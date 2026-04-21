// testing the sliding window rate limiter in isolation — no redis container needed
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

vi.mock("../config/redis", () => ({
  redisClient: {
    zRemRangeByScore: vi.fn().mockResolvedValue(0),
    zCard: vi.fn().mockResolvedValue(0),
    zAdd: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

import { redisClient } from "../config/redis";
import { slidingWindowRateLimiter } from "../middlewares/rateLimiter";

const mockZRemRangeByScore = vi.mocked(redisClient.zRemRangeByScore);
const mockZCard = vi.mocked(redisClient.zCard);
const mockZAdd = vi.mocked(redisClient.zAdd);
const mockExpire = vi.mocked(redisClient.expire);

function makeReq(userId = "user-123"): AuthenticatedRequest {
  return { headers: {}, user: { userId } } as unknown as AuthenticatedRequest;
}

function makeRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => vi.clearAllMocks());

describe("slidingWindowRateLimiter", () => {
  it("calls next() when under limit", async () => {
    mockZCard.mockResolvedValue(3);
    const next: NextFunction = vi.fn();
    await slidingWindowRateLimiter(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when limit is hit", async () => {
    mockZCard.mockResolvedValue(5);
    const res = makeRes();
    const next: NextFunction = vi.fn();
    await slidingWindowRateLimiter(makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  it("removes old window entries before checking count", async () => {
    mockZCard.mockResolvedValue(0);
    await slidingWindowRateLimiter(makeReq(), makeRes(), vi.fn());
    expect(mockZRemRangeByScore).toHaveBeenCalledTimes(1);
    const [, min] = mockZRemRangeByScore.mock.calls[0];
    expect(min).toBe(0);
  });

  it("adds the request to the sorted set when allowed", async () => {
    mockZCard.mockResolvedValue(1);
    await slidingWindowRateLimiter(makeReq(), makeRes(), vi.fn());
    expect(mockZAdd).toHaveBeenCalledTimes(1);
    expect(mockExpire).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when redis throws", async () => {
    mockZRemRangeByScore.mockRejectedValueOnce(new Error("connection refused"));
    const res = makeRes();
    await slidingWindowRateLimiter(makeReq(), res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("uses per-user keys so users don't share limits", async () => {
    mockZCard.mockResolvedValue(0);
    await slidingWindowRateLimiter(makeReq("alice"), makeRes(), vi.fn());
    await slidingWindowRateLimiter(makeReq("bob"), makeRes(), vi.fn());
    const [keyAlice] = mockZRemRangeByScore.mock.calls[0];
    const [keyBob] = mockZRemRangeByScore.mock.calls[1];
    expect(keyAlice).toContain("alice");
    expect(keyBob).toContain("bob");
    expect(keyAlice).not.toBe(keyBob);
  });
});
