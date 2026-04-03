import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/tokenUtils.js";
import { User } from "../models/userModel.js";

/**
 * Middleware to protect routes — verifies JWT from Authorization header
 * and attaches user to req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Access denied. No token provided.");
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid token. User not found.");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }

        // JWT specific errors
        if (error.name === "JsonWebTokenError") {
            return next(new ApiError(401, "Invalid token."));
        }
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Token expired."));
        }

        return next(new ApiError(401, "Authentication failed."));
    }
};

export default authMiddleware;
