import { Request, Response, NextFunction } from "express";
import UserModel from "../../auth/document/auth.document";

export function authorize(allowedRoles: string[]) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.user_id;
      const user = await UserModel.findById(userId).select("role").lean();
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
      if (allowedRoles.includes(user.role)) {
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
      return res.status(403).json({
        success: false,
        active: true,
        data: {},
        message: "",
        error: {
          message: `${error.message} || error in authorization`,
        },
      });
    }
  };
}
