import { Request, Response } from "express";
import User from "../models/User";
import { generateApiKey } from "../utils/generateApiKey";
import logger from "../utils/logger";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "USER_REGISTRATION_ATTEMPT",
      email,
    });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.warn({
        requestId: (req as any).requestId,
        event: "USER_ALREADY_EXISTS",
        email,
      });
      return res.status(400).json({ message: "User already exists" });
    }

    const apiKey = generateApiKey();

    const newUser = await User.create({
      email,
      apiKey
    });

    logger.info({
      requestId: (req as any).requestId,
      event: "USER_REGISTERED_SUCCESS",
      userId: newUser._id,
      email,
      plan: newUser.plan,
    });

    res.status(201).json({
    message: "User registered successfully",
    userId: newUser._id,
    apiKey: newUser.apiKey,
    plan: newUser.plan
    });

  } catch (error) {
    logger.error({
      requestId: (req as any).requestId,
      event: "USER_REGISTRATION_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyApiKey = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "API_KEY_VERIFICATION_ATTEMPT",
    });

    const user = await User.findOne({ apiKey });

    if (!user) {
      logger.warn({
        requestId: (req as any).requestId,
        event: "INVALID_API_KEY",
      });
      return res.status(401).json({ message: "Invalid API key" });
    }

    logger.info({
      requestId: (req as any).requestId,
      event: "API_KEY_VERIFIED",
      userId: user._id,
    });

    res.status(200).json({
      valid: true,
      userId: user._id,
      plan: user.plan,

    });

  } catch (error) {
    logger.error({
      requestId: (req as any).requestId,
      event: "API_KEY_VERIFICATION_ERROR",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

