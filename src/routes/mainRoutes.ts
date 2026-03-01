import { Router } from "express";
import authRoutes from "../auth_module/auth.routes";
import taskRoutes from "../appModule/taskModule/task.routes";
import userRoutes from "../appModule/userModule/user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);

export default router;
