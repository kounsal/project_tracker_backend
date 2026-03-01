import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { sendResponse } from "../../utils/response_model";


export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, status } = req.body;
        const userId = req.userId;

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        if (!title) {
            sendResponse(res, 400, false, {}, "Validation Error", "Title is required");
            return;
        }

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                status: status || "PENDING",
                userId,
            },
        });

        sendResponse(res, 201, true, newTask, "", "Task created successfully");
    } catch (error) {
        console.error("Create task error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to create task");
    }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const page = req.query.page as string || "1";
        const limit = req.query.limit as string || "10";
        const status = req.query.status as string;
        const search = req.query.search as string;

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Build the query where clause
        const whereClause: any = { userId };

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.title = {
                contains: search,
                mode: "insensitive",
            };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            skip,
            take: limitNumber,
            orderBy: { createdAt: "desc" },
        });

        const totalCount = await prisma.task.count({ where: whereClause });

        const responseData = {
            tasks,
            pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
            },
        };

        sendResponse(res, 200, true, responseData, "", "Tasks retrieved successfully");
    } catch (error) {
        console.error("Get tasks error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to retrieve tasks");
    }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const taskIdStr = req.params.id as string;
        const taskId = parseInt(taskIdStr, 10);

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        if (isNaN(taskId)) {
            sendResponse(res, 400, false, {}, "Validation Error", "Invalid task ID");
            return;
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId, // Ensures the task belongs to the user
            },
        });

        if (!task) {
            sendResponse(res, 404, false, {}, "Not Found", "Task not found");
            return;
        }

        sendResponse(res, 200, true, task, "", "Task retrieved successfully");
    } catch (error) {
        console.error("Get task by ID error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to retrieve task");
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const taskIdStr = req.params.id as string;
        const taskId = parseInt(taskIdStr, 10);
        const { title, description, status } = req.body;

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        if (isNaN(taskId)) {
            sendResponse(res, 400, false, {}, "Validation Error", "Invalid task ID");
            return;
        }

        // Check if task exists and belongs to user
        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            sendResponse(res, 404, false, {}, "Not Found", "Task not found");
            return;
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title: title !== undefined ? title : existingTask.title,
                description: description !== undefined ? description : existingTask.description,
                status: status !== undefined ? status : existingTask.status,
            },
        });

        sendResponse(res, 200, true, updatedTask, "", "Task updated successfully");
    } catch (error) {
        console.error("Update task error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to update task");
    }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const taskIdStr = req.params.id as string;
        const taskId = parseInt(taskIdStr, 10);

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        if (isNaN(taskId)) {
            sendResponse(res, 400, false, {}, "Validation Error", "Invalid task ID");
            return;
        }

        // Check if task exists and belongs to user
        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            sendResponse(res, 404, false, {}, "Not Found", "Task not found");
            return;
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        sendResponse(res, 200, true, {}, "", "Task deleted successfully");
    } catch (error) {
        console.error("Delete task error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to delete task");
    }
};

export const toggleTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const taskIdStr = req.query.id as string;
        const taskId = parseInt(taskIdStr, 10);

        if (!userId) {
            sendResponse(res, 401, false, {}, "Unauthorized", "User not authenticated");
            return;
        }

        if (isNaN(taskId)) {
            sendResponse(res, 400, false, {}, "Validation Error", "Invalid task ID");
            return;
        }

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId },
        });

        if (!existingTask) {
            sendResponse(res, 404, false, {}, "Not Found", "Task not found");
            return;
        }

        const newStatus = existingTask.status === "COMPLETED" ? "PENDING" : "COMPLETED";

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        });

        sendResponse(res, 200, true, updatedTask, "", "Task status toggled successfully");
    } catch (error) {
        console.error("Toggle task error:", error);
        sendResponse(res, 500, false, {}, "Internal server error", "Failed to toggle task status");
    }
};
