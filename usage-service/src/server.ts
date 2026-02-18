import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger";
import { connectDB } from "./config/db";
import usageRoutes from "./routes/usageRoutes";

dotenv.config();

const app = express();

// VERY IMPORTANT — BEFORE routes
app.use(express.json());
app.use(cors());

// Request ID middleware
app.use((req, _res, next) => {
  (req as any).requestId = req.headers["x-request-id"] || "unknown";
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
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  })
);

connectDB();

app.use("/usage", usageRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: process.env.SERVICE_NAME || "usage-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 4002;

const server = app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info({ port: PORT }, `Usage Service running on port ${PORT}`);
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
