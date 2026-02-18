import express from "express";
import { initializeUsage, consumeTokens , getUsage } from "../controllers/usageController";

const router = express.Router();

router.post("/init", initializeUsage);
router.post("/consume-tokens", consumeTokens);
router.get("/:userId", getUsage);

export default router;
