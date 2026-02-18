import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger";
import aiRoutes from "./routes/aiRoutes";

const app = express();

dotenv.config();

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
    customProps: (req) => ({
      requestId: req.headers["x-request-id"],
    }),
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  })
);

app.use("/ai", aiRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "AI Service Running" });
});

const PORT = process.env.PORT || 4003;

app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info({ port: PORT }, `AI Service running on port ${PORT}`);
});
