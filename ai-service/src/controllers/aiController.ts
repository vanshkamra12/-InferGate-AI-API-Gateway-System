import { Request, Response } from "express";
import axios from "axios";
import logger from "../utils/logger";

export const generateResponse = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "AI_GENERATION_START",
      promptLength: prompt.length,
    });

    const startTime = Date.now();

    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      {
        model: process.env.MODEL,
        prompt,
        stream: false
      },
      {
 timeout: 60000 
  } 
    );

    const duration = Date.now() - startTime;
    const tokens = response.data.prompt_eval_count + response.data.eval_count;

    logger.info({
      requestId: (req as any).requestId,
      event: "AI_GENERATION_SUCCESS",
      duration,
      tokens,
      model: process.env.MODEL,
    });

    res.status(200).json({
    output: response.data.response,
    tokens
});

  } catch (error: any) {
    logger.error({
      requestId: (req as any).requestId,
      event: "AI_GENERATION_ERROR",
      error: error.message,
    });
    res.status(500).json({ message: "AI generation failed" });
  }
};
