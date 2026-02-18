import { Request, Response } from "express";
import User from "../models/User";
import { generateApiKey } from "../utils/generateApiKey";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`[${(req as any).requestId}] Registering user: ${email}`);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`[${(req as any).requestId}] User already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const apiKey = generateApiKey();

    const newUser = await User.create({
      email,
      apiKey
    });

    console.log(`[${(req as any).requestId}] User registered successfully: ${newUser._id}`);

    res.status(201).json({
    message: "User registered successfully",
    userId: newUser._id,
    apiKey: newUser.apiKey,
    plan: newUser.plan
    });

  } catch (error) {
    console.error(`[${(req as any).requestId}] Register Error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyApiKey = async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    console.log(`[${(req as any).requestId}] Verifying API key`);

    const user = await User.findOne({ apiKey });

    if (!user) {
      console.log(`[${(req as any).requestId}] Invalid API key`);
      return res.status(401).json({ message: "Invalid API key" });
    }

    console.log(`[${(req as any).requestId}] API key verified for user: ${user._id}`);

    res.status(200).json({
      valid: true,
      userId: user._id,
      plan: user.plan,

    });

  } catch (error) {
    console.error(`[${(req as any).requestId}] Verify Error:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

