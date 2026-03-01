import { Router } from "express";
import { getUserProfile, updateUserProfile } from "./user.controller";
import { authenticateToken } from "../../middleware/auth_middleware";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get("/me", getUserProfile);
router.patch("/me", updateUserProfile);

export default router;
