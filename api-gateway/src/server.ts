import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestIdMiddleware } from "./middlewares/requestId";
import { requestLogger } from "./middlewares/logger";
import { authenticate } from "./middlewares/authMiddleware";
import { testRoute } from "./controllers/testController";
import { connectRedis } from "./config/redis";
import { slidingWindowRateLimiter } from "./middlewares/rateLimiter";
import { chatHandler } from "./controllers/chatController";
import { registerHandler } from "./controllers/registerController";
import { getUsageHandler } from "./controllers/usageController";




connectRedis();


dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));



app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "API Gateway Running" });
});
app.get("/test", authenticate, slidingWindowRateLimiter, testRoute);
app.post("/v1/register", registerHandler);

app.post(
  "/v1/chat",
  authenticate,
  slidingWindowRateLimiter,
  chatHandler
);
app.get(
  "/v1/usage",
  authenticate,
  getUsageHandler
);


const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`API Gateway running on port ${PORT}`);
});
