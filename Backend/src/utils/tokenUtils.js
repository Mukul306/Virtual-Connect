import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: config.jwtAccessExpiry,
    });
};

/**
 * Generate a long-lived refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: config.jwtRefreshExpiry,
    });
};

/**
 * Verify a JWT token — returns decoded payload or throws
 */
export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};
