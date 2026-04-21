// testing the sliding window rate limiter in isolation — no redis container needed

const mockZRemRangeByScore = jest.fn().mockResolvedValue(0);
const mockZCard = jest.fn().mockResolvedValue(0);
const mockZAdd = jest.fn().mockResolvedValue(1);
const mockExpire = jest.fn().mockResolvedValue(1);

jest.mock("../config/redis", () => ({
  redisClient: {
    zRemRangeByScore: mockZRemRangeByScore,
    zCard: mockZCard,
    zAdd: mockZAdd,
    expire: mockExpire,
  },
}));

import { slidingWindowRateLimiter } from "../middlewares/rateLimiter";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware";

function makeReq(userId = "user-123"): AuthenticatedRequest {
  return { headers: {}, user: { userId } } as unknown as AuthenticatedRequest;
}

function makeRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => jest.clearAllMocks());

describe("slidingWindowRateLimiter", () => {
  it("calls next() when under limit", async () => {
    mockZCard.mockResolvedValue(3);
    const next: NextFunction = jest.fn();
    await slidingWindowRateLimiter(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when limit is hit", async () => {
    mockZCard.mockResolvedValue(5);
    const res = makeRes();
    const next: NextFunction = jest.fn();
    await slidingWindowRateLimiter(makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  it("removes old window entries before checking count", async () => {
    mockZCard.mockResolvedValue(0);
    await slidingWindowRateLimiter(makeReq(), makeRes(), jest.fn());
    expect(mockZRemRangeByScore).toHaveBeenCalledTimes(1);
    const [, min] = mockZRemRangeByScore.mock.calls[0];
    expect(min).toBe(0);
  });

  it("adds the request to the sorted set when allowed", async () => {
    mockZCard.mockResolvedValue(1);
    await slidingWindowRateLimiter(makeReq(), makeRes(), jest.fn());
    expect(mockZAdd).toHaveBeenCalledTimes(1);
    expect(mockExpire).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when redis throws", async () => {
    mockZRemRangeByScore.mockRejectedValueOnce(new Error("connection refused"));
    const res = makeRes();
    await slidingWindowRateLimiter(makeReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("uses per-user keys so users don't share limits", async () => {
    mockZCard.mockResolvedValue(0);
    await slidingWindowRateLimiter(makeReq("alice"), makeRes(), jest.fn());
    await slidingWindowRateLimiter(makeReq("bob"), makeRes(), jest.fn());
    const [keyAlice] = mockZRemRangeByScore.mock.calls[0];
    const [keyBob] = mockZRemRangeByScore.mock.calls[1];
    expect(keyAlice).toContain("alice");
    expect(keyBob).toContain("bob");
    expect(keyAlice).not.toBe(keyBob);
  });
});
