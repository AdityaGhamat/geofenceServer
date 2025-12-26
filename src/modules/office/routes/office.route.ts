import { Router } from "express";
import { authMiddleware } from "../../auth/middlewares/authmiddleware";
import { adminMiddleware } from "../middlewares/adminmiddleware";
import officeController from "../office.controller";
import { authorize } from "../middlewares/authorizeAccess";

const app = Router();

app.post("/create-new-office", authMiddleware, officeController.createOffice);

app.patch(
  "/update-location",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.updateLocation
);

app.patch(
  "/change-working-days",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.changeWorkingDays
);

app.patch(
  "/change-working-times",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.changeWorkingTime
);
app.patch(
  "/change-active-status",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.changeActiveStatus
);

app.patch(
  "/update-admin",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.UpdateAdmin
);
app.patch("/remove-admin", authMiddleware, authorize(["super_admin"]));

app.get(
  "/info",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.getOffice
);

app.get(
  "/workers",
  authMiddleware,
  authorize(["admin", "super_admin"]),
  officeController.getWorkers
);

export default app;
