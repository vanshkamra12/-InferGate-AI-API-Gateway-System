import { Request, Response } from "express";
import axios from "axios";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`[${req.headers["x-request-id"]}] Registration request for email: ${email}`);

    // 1️⃣ Call Auth Service
    console.log(`[${req.headers["x-request-id"]}] Calling auth service`);
    const authResponse = await axios.post(
      process.env.AUTH_SERVICE_URL + "/auth/register",
      { email },
      {
        headers: { "x-request-id": req.headers["x-request-id"] as string }
      }
    );

    const { apiKey, plan } = authResponse.data;
    const userId = authResponse.data.userId;

    console.log(`[${req.headers["x-request-id"]}] User registered: ${userId}, plan: ${plan}`);

    // 2️⃣ Try to initialize usage (non-blocking failure)
    try {
      console.log(`[${req.headers["x-request-id"]}] Initializing usage service`);
      await axios.post(
        process.env.USAGE_SERVICE_URL + "/usage/init",
        {
          userId,
          monthlyTokenLimit: plan === "FREE" ? 5000 : 50000
        },
        {
          headers: { "x-request-id": req.headers["x-request-id"] as string }
        }
      );
      console.log(`[${req.headers["x-request-id"]}] Usage initialized successfully`);
    } catch (usageError) {
      console.error(`[${req.headers["x-request-id"]}] Usage provisioning failed:`, usageError);
      // Do NOT fail registration
    }

    console.log(`[${req.headers["x-request-id"]}] Registration completed successfully`);

    return res.status(201).json({
      message: "User registered successfully",
      apiKey,
      plan
    });

  } catch (error: any) {
    console.error(`[${req.headers["x-request-id"]}] Register Error:`, error.response?.data || error.message);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};
