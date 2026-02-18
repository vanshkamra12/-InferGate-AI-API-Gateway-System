import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

connectDB();

app.use("/usage", usageRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Usage Service Running" });
});

const PORT = process.env.PORT || 4002;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Usage Service running on port ${PORT}`);
});
