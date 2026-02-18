import { Request, Response } from "express";
import Usage from "../models/Usage";
import RequestLog from "../models/RequestLog";
import logger from "../utils/logger";

export const initializeUsage = async (req: Request, res: Response) => {
  try {
    const { userId, monthlyTokenLimit } = req.body;

    logger.info({
      requestId: (req as any).requestId,
      event: "USAGE_INIT_ATTEMPT",
      userId,
      monthlyTokenLimit,
    });

    await Usage.create({
      userId,
      monthlyTokenLimit
    });

    logger.info({
      requestId: (req as any).requestId,
      event: "USAGE_INIT_SUCCESS",
      userId,
    });

    res.status(201).json({ message: "Usage initialized" });

  } catch (error) {
    logger.error({
      requestId: (req as any).requestId,
      event: "USAGE_INIT_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const consumeTokens = async (req: Request, res: Response) => {
  try {
    const { userId, tokens, responseTimeMs } = req.body;

    logger.info({
      requestId: (req as any).requestId,
      event: "TOKEN_CONSUMPTION_ATTEMPT",
      userId,
      tokens,
    });

    if (!userId || !tokens) {
      return res.status(400).json({
        message: "userId and tokens are required"
      });
    }

    const usage = await Usage.findOne({ userId });

    if (!usage) {
      return res.status(404).json({
        message: "Usage record not found"
      });
    }

    // 🔥 Monthly reset logic
    const now = new Date();
    const lastReset = new Date(usage.lastResetDate);

    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      usage.usedTokens = 0;
      usage.lastResetDate = now;
      await usage.save();
    }

    // 🔥 Atomic increment with limit check
    const updatedUsage = await Usage.findOneAndUpdate(
      {
        userId,
        $expr: {
          $lte: [
            { $add: ["$usedTokens", tokens] },
            "$monthlyTokenLimit"
          ]
        }
      },
      {
        $inc: { usedTokens: tokens }
      },
      { returnDocument: "after" }
    );

    if (!updatedUsage) {

      logger.warn({
        requestId: (req as any).requestId,
        event: "TOKEN_QUOTA_EXCEEDED",
        userId,
        tokens,
      });

      await RequestLog.create({
        userId,
        tokensUsed: tokens,
        responseTimeMs: responseTimeMs || 0,
        status: "FAILED"
      });

      return res.status(403).json({
        message: "Token quota exceeded"
      });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "TOKENS_CONSUMED_SUCCESS",
      userId,
      tokens,
      usedTokens: updatedUsage.usedTokens,
      monthlyTokenLimit: updatedUsage.monthlyTokenLimit,
    });

    await RequestLog.create({
      userId,
      tokensUsed: tokens,
      responseTimeMs: responseTimeMs || 0,
      status: "SUCCESS"
    });

    return res.status(200).json({
      message: "Tokens consumed",
      usedTokens: updatedUsage.usedTokens,
      monthlyTokenLimit: updatedUsage.monthlyTokenLimit
    });

  } catch (error) {
    logger.error({
      requestId: (req as any).requestId,
      event: "TOKEN_CONSUMPTION_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info({
      requestId: (req as any).requestId,
      event: "GET_USAGE_ATTEMPT",
      userId,
    });

    const usage = await Usage.findOne({ userId });

    if (!usage) {
      logger.warn({
        requestId: (req as any).requestId,
        event: "USAGE_NOT_FOUND",
        userId,
      });
      return res.status(404).json({ message: "Usage not found" });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "GET_USAGE_SUCCESS",
      userId,
      usedTokens: usage.usedTokens,
      monthlyTokenLimit: usage.monthlyTokenLimit,
    });

    res.status(200).json({
      usedTokens: usage.usedTokens,
      monthlyTokenLimit: usage.monthlyTokenLimit
    });

  } catch (error) {
    logger.error({
      requestId: (req as any).requestId,
      event: "GET_USAGE_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ message: "Internal server error" });
  }
};



