import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

// Generate short-lived Access Token
export const generateAccessToken = (userId: number): string => {
    return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: "15m" });
};

// Generate long-lived Refresh Token
export const generateRefreshToken = (userId: number): string => {
    return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: "7d" });
};

// Verify Access Token
export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET);
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET);
};
