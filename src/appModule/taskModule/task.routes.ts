import { Router } from "express";
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    toggleTaskStatus
} from "./task.controller";
import { authenticateToken } from "../../middleware/auth_middleware";

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.post("/", createTask);
router.get("/", getTasks);

router.patch("/toggle", toggleTaskStatus);
router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);


export default router;
