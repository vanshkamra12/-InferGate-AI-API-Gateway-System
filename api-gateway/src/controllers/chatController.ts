import { Response } from "express";
import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const chatHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`[${req.headers["x-request-id"]}] Chat request from user: ${userId}`);
    console.log(`[${req.headers["x-request-id"]}] Prompt: "${prompt.substring(0, 50)}..."`);
    const start = Date.now();


    // 1️⃣ Call AI Service first (we need token count)
    console.log(`[${req.headers["x-request-id"]}] Calling AI service`);
    const aiResponse = await axios.post(
      process.env.AI_SERVICE_URL + "/ai/generate",
      { prompt },
      { 
        timeout: 30000,
        headers: { "x-request-id": req.headers["x-request-id"] as string }
      }
    );

    const output = aiResponse.data.output;
    const totalTokens = aiResponse.data.tokens;

    console.log(`[${req.headers["x-request-id"]}] AI service responded. Tokens used: ${totalTokens}`);
    const duration = Date.now() - start;


    // 2️⃣ Deduct tokens atomically
    console.log(`[${req.headers["x-request-id"]}] Calling usage service to consume tokens`);
    await axios.post(
      process.env.USAGE_SERVICE_URL + "/usage/consume-tokens",
      {
        userId,
        tokens: totalTokens,
        responseTimeMs: duration
      },
      {
        headers: { "x-request-id": req.headers["x-request-id"] as string }
      }
    );

    console.log(`[${req.headers["x-request-id"]}] Request completed successfully in ${duration}ms`);


    // 3️⃣ Return final response
    return res.status(200).json({
      output,
      tokensUsed: totalTokens
    });

  } catch (error: any) {

    // 🔴 Token quota exceeded
    if (error.response?.status === 403) {
      return res.status(403).json({
        message: "Token quota exceeded"
      });
    }

    // 🔴 AI timeout
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "AI service timeout"
      });
    }

    // 🔴 Upstream service error
    if (error.response) {
      console.error(`[${req.headers["x-request-id"]}] Upstream error:`, error.response.data);
    } else {
      console.error(`[${req.headers["x-request-id"]}] Gateway Error:`, error.message);
    }

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
