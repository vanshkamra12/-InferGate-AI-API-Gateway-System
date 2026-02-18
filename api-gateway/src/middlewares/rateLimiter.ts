import { Response, NextFunction } from "express";
import { redisClient } from "../config/redis";
import { AuthenticatedRequest } from "./authMiddleware";

const WINDOW_SIZE = 60; // seconds
const MAX_REQUESTS = 5;

export const slidingWindowRateLimiter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    const key = `rate_limit:${userId}`;

    const currentTime = Date.now();
    const windowStart = currentTime - WINDOW_SIZE * 1000;

    // Remove old entries
    await redisClient.zRemRangeByScore(key, 0, windowStart);

    // Count remaining requests
    const requestCount = await redisClient.zCard(key);

    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        message: "Too many requests. Try again later."
      });
    }

    // Add current request
    await redisClient.zAdd(key, {
      score: currentTime,
      value: currentTime.toString()
    });

    // Set expiry to auto-clean Redis
    await redisClient.expire(key, WINDOW_SIZE);

    next();

  } catch (error) {
    console.error("Rate limit error:", error);
    res.status(500).json({ message: "Rate limiting failed" });
  }
};
