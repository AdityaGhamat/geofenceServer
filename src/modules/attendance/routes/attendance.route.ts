import { Router } from "express";
import attendanceController from "../attendance.controller";
import { authMiddleware } from "../../auth/middlewares/authmiddleware";
const app = Router();
app.post("/mark-attendance", attendanceController.manualMarkAttendance);
app.get("/analytics", authMiddleware, attendanceController.userAnalytics);
export default app;
