import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendResponse } from "../utils/response_model";

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
        sendResponse(res, 401, false, {}, "Access token is missing", "Failed to authenticate token");
        return;
    }

    try {
        const decoded = verifyAccessToken(token) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        sendResponse(res, 403, false, {}, "Invalid or expired access token", "Failed to authenticate token");
    }
};
