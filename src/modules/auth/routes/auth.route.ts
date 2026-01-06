import { Router } from "express";
import authController from "../auth.controller";
import { authMiddleware } from "../middlewares/authmiddleware";

const app = Router();
app.post("/create-new-user", authController.CreateUser);
app.post("/sign-in", authController.SignIn);
app.patch("/update-password", authMiddleware, authController.updatePassword);
app.get("/refresh", authController.refresh);
app.get("/logout", authMiddleware, authController.logOut);
app.get("/get-location", authMiddleware, authController.getLocation);
app.patch("/update-location", authMiddleware, authController.updateLocation);
app.get("/profile", authMiddleware, authController.getProfile);
app.patch("/join-office/:oi", authMiddleware, authController.joinOffice);
app.patch("/leave-office/:oi", authMiddleware, authController.leaveOffice);
export default app;
