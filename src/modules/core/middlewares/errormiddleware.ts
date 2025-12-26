import { Request, Response, NextFunction } from "express";
export async function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error.stack);
  const message = error.message || "Error not recongnized";
  res.status(error.statusCode || 400).json({
    status: "error",
    message
  });
}
