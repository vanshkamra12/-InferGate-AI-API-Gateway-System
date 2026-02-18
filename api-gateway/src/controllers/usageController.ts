import { Response } from "express";
import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getUsageHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`[${req.headers["x-request-id"]}] Fetching usage for user: ${userId}`);

    const usageResponse = await axios.get(
      process.env.USAGE_SERVICE_URL + `/usage/${userId}`,
      {
        headers: { "x-request-id": req.headers["x-request-id"] as string }
      }
    );

    const { usedTokens, monthlyTokenLimit } = usageResponse.data;

    const remainingTokens = monthlyTokenLimit - usedTokens;
    const percentageUsed =
      ((usedTokens / monthlyTokenLimit) * 100).toFixed(2);

    console.log(`[${req.headers["x-request-id"]}] Usage fetched: ${usedTokens}/${monthlyTokenLimit} (${percentageUsed}%)`);

    return res.status(200).json({
      usedTokens,
      monthlyLimit: monthlyTokenLimit,
      remainingTokens,
      percentageUsed: Number(percentageUsed)
    });

  } catch (error: any) {
    console.error(`[${req.headers["x-request-id"]}] Usage fetch error:`, error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to fetch usage"
    });
  }
};
