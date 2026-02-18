import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const userId =
      (req as any).user?.userId?.toString().slice(0, 8) || "anonymous";

    console.log(
      `${req.method} ${req.originalUrl} | user=${userId} | ${duration}ms | ${res.statusCode}`
    );
  });

  next();
};
