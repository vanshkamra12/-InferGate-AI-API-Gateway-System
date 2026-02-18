import { Request, Response, NextFunction } from "express";
import axios from "axios";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({ message: "API key missing" });
    }

    console.log(`[${req.headers["x-request-id"]}] Validating API key`);

    const response = await axios.post(
      process.env.AUTH_SERVICE_URL + "/auth/verify",
      { apiKey },
      {
        headers: { "x-request-id": req.headers["x-request-id"] as string }
      }
    );

    req.user = response.data;
    console.log(`[${req.headers["x-request-id"]}] Auth successful for user: ${response.data.userId}`);

    next();

  } catch (error: any) {
    console.error(`[${req.headers["x-request-id"]}] Auth failed`);
    return res.status(401).json({ message: "Invalid API key" });
  }
};
