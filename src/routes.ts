import { Router } from "express";
import authRoutes from "./modules/auth/routes/auth.route";
import attendanceRoutes from "./modules/attendance/routes/attendance.route";
import officeRoutes from "./modules/office/routes/office.route";
const apiRoutes = Router();
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/attendance", attendanceRoutes);
apiRoutes.use("/office", officeRoutes);
export default apiRoutes;
