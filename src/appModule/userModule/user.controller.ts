import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { sendResponse } from "../../utils/response_model";

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                // Exclude password
            },
        });

        if (!user) {
            sendResponse(res, 404, false, {}, "Not Found", "User not found");
            return;
        }

        sendResponse(res, 200, true, user, "", "Profile retrieved successfully");
    } catch (error) {
        console.error("Get user profile error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to retrieve user profile");
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const { name } = req.body; // Can expand to update other fields like email/password later

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        // Optional: Check if at least one field is provided to update
        if (name === undefined) {
            sendResponse(res, 400, false, {}, "Validation Error", "No fields provided to update");
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                // Exclude password
            },
        });

        sendResponse(res, 200, true, updatedUser, "", "Profile updated successfully");
    } catch (error) {
        console.error("Update user profile error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to update user profile");
    }
};
