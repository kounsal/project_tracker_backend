import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendResponse } from "../utils/response_model";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name, password } = req.body;

        if (!email || !password || !name) {
            sendResponse(res, 400, false, {}, "Validation Error", "Email, name, and password are required");
            return;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            sendResponse(res, 400, false, {}, "Conflict", "Email already in use");
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        sendResponse(res, 201, true, {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
            accessToken,
            refreshToken,
        }, "", "User registered successfully");
    } catch (error) {
        console.error("Registration error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Registration failed");
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            sendResponse(res, 400, false, {}, "Validation Error", "Email and password are required");
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            sendResponse(res, 401, false, {}, "Unauthorized", "Invalid email or password");
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            sendResponse(res, 401, false, {}, "Unauthorized", "Invalid email or password");
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        sendResponse(res, 200, true, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            accessToken,
            refreshToken,
        }, "", "Login successful");
    } catch (error) {
        console.error("Login error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Login failed");
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            sendResponse(res, 401, false, {}, "Validation Error", "Refresh token is required");
            return;
        }

        try {
            const decoded = verifyRefreshToken(refreshToken) as { userId: number };

            // Optionally verify user still exists in DB
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
            });

            if (!user) {
                sendResponse(res, 401, false, {}, "Unauthorized", "User not found");
                return;
            }

            // Generate new access token
            const newAccessToken = generateAccessToken(user.id);

            sendResponse(res, 200, true, { accessToken: newAccessToken }, "", "Token refreshed successfully");
        } catch (error) {
            sendResponse(res, 403, false, {}, "Forbidden", "Invalid or expired refresh token");
        }
    } catch (error) {
        console.error("Refresh token error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Token refresh failed");
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    sendResponse(res, 200, true, {}, "", "Successfully logged out. Please clear your tokens.");
};
