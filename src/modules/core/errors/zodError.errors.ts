import { Response } from "express";
export const sendZodError = (res: Response, zodError: any) => {
  return res.status(400).json({
    success: false,
    active: true,
    data: {},
    message: "Validation Error",
    error: {
      message: "The data provided is invalid or missing required fields.",
      fields: zodError.flatten().fieldErrors,
    },
    timestamp: new Date().toISOString(),
  });
};
