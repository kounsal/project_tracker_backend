import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { authenticateToken } from "../middleware/auth_middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Example protected route for testing
router.get("/me", authenticateToken, (req, res) => {
    res.json({ message: "Protected route accessed", userId: req.userId });
});

export default router;
