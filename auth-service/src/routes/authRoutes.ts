import express from "express";
import { registerUser  , verifyApiKey } from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", verifyApiKey);


export default router;
