import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];

    // Header should be: "Bearer <token>"
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Access token is missing" });
        return;
    }

    try {
        const decoded = verifyAccessToken(token) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired access token" });
    }
};
