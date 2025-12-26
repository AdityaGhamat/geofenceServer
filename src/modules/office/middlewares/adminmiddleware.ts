import { Request, Response, NextFunction } from "express";
import UserModel from "../../auth/document/auth.document";

export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.user_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "User Id is not provided",
        },
      });
    }
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "User not found",
        },
      });
    }
    if (user.role === "admin" || user.role === "super_admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: "Unauthorized, only for admin",
        },
      });
    }
  } catch (error: any) {
    return res.status(error.statusCode || 403).json({
      success: false,
      active: true,
      data: {},
      message: "",
      error: {
        message: `unauthorized error occured,${error}`,
      },
    });
  }
}
