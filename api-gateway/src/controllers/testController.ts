import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const testRoute = (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
};
