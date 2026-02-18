import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

app.use("/auth", authRoutes);


connectDB();

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Auth Service Running" });
});

const PORT = process.env.PORT || 4001;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Auth Service running on port ${PORT}`);
});
