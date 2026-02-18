import { Request, Response } from "express";
import axios from "axios";

export const generateResponse = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    console.log(`[${(req as any).requestId}] Generating AI response for prompt: "${prompt.substring(0, 50)}..."`);

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

    console.log(`[${(req as any).requestId}] AI response generated in ${duration}ms, tokens: ${tokens}`);

    res.status(200).json({
    output: response.data.response,
    tokens
});

  } catch (error: any) {
    console.error(`[${(req as any).requestId}] Ollama Error:`, error.message);
    res.status(500).json({ message: "AI generation failed" });
  }
};
