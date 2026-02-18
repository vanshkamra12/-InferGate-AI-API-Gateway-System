import { Request, Response } from "express";
import Usage from "../models/Usage";
import RequestLog from "../models/RequestLog";

export const initializeUsage = async (req: Request, res: Response) => {
  try {
    const { userId, monthlyTokenLimit } = req.body;

    console.log(`[${(req as any).requestId}] Initializing usage for user: ${userId}`);

    await Usage.create({
      userId,
      monthlyTokenLimit
    });

    console.log(`[${(req as any).requestId}] Usage initialized successfully`);

    res.status(201).json({ message: "Usage initialized" });

  } catch (error) {
    console.error(`[${(req as any).requestId}] Init Usage Error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const consumeTokens = async (req: Request, res: Response) => {
  try {
    const { userId, tokens, responseTimeMs } = req.body;

    console.log(`[${(req as any).requestId}] Consuming ${tokens} tokens for user: ${userId}`);

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

      console.log(`[${(req as any).requestId}] Token quota exceeded for user: ${userId}`);

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

    console.log(`[${(req as any).requestId}] Tokens consumed successfully. Used: ${updatedUsage.usedTokens}/${updatedUsage.monthlyTokenLimit}`);

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
    console.error(`[${(req as any).requestId}] Consume Token Error:`, error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    console.log(`[${(req as any).requestId}] Getting usage for user: ${userId}`);

    const usage = await Usage.findOne({ userId });

    if (!usage) {
      console.log(`[${(req as any).requestId}] Usage not found for user: ${userId}`);
      return res.status(404).json({ message: "Usage not found" });
    }

    console.log(`[${(req as any).requestId}] Usage retrieved: ${usage.usedTokens}/${usage.monthlyTokenLimit}`);

    res.status(200).json({
      usedTokens: usage.usedTokens,
      monthlyTokenLimit: usage.monthlyTokenLimit
    });

  } catch (error) {
    console.error(`[${(req as any).requestId}] Get Usage Error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};



