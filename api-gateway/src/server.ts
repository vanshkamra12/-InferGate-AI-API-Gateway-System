import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger";
import { requestIdMiddleware } from "./middlewares/requestId";
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

// Metrics tracking
let totalRequests = 0;

// Request ID middleware (must be before pinoHttp)
app.use(requestIdMiddleware);

// Request counter middleware
app.use((_req, _res, next) => {
  totalRequests++;
  next();
});

// Pino HTTP logger middleware
app.use(
  pinoHttp({
    logger,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers['x-api-key']",
        "req.headers.cookie",
      ],
      remove: true,
    },
    customProps: (req) => ({
      requestId: req.headers["x-request-id"],
    }),
    // Don't log health checks
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: process.env.SERVICE_NAME || "gateway",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/metrics", (_req, res) => {
  res.status(200).json({
    totalRequests,
    uptime: process.uptime(),
    memoryUsage: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
    timestamp: new Date().toISOString(),
  });
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

const server = app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info({ port: PORT }, `API Gateway running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown() {
  logger.info("Gracefully shutting down...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
}
