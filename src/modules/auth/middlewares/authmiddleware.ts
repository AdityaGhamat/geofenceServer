import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomPayload } from "../types/auth.document";
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tokenFromCookie = req.cookies.Authorization;
  const tokenFromHeader = req.headers.authorization as string;
  const token = tokenFromCookie || tokenFromHeader;
  if (!token) {
    return res.status(401).json({
      success: false,
      active: true,
      data: {},
      message: "",
      error: {
        message: "token not found",
      },
    });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.COOKIE_SECRET_KEY as string
    ) as CustomPayload;

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
  }
}
