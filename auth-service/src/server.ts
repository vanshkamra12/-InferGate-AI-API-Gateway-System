import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

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
        "req.body.password",
        "req.body.apiKey",
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

app.use("/auth", authRoutes);


connectDB();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: process.env.SERVICE_NAME || "auth-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 4001;

const server = app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info({ port: PORT }, `Auth Service running on port ${PORT}`);
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
