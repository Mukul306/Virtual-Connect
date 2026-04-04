import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/tokenUtils.js";
import { User } from "../models/userModel.js";

/**
 * Optional auth middleware — sets req.user if token present,
 * but does NOT reject unauthenticated requests.
 * Used for endpoints accessible to both guests and logged-in users.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token — continue as guest
            req.user = null;
            return next();
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        req.user = user || null;
        next();
    } catch {
        // Token invalid/expired — continue as guest
        req.user = null;
        next();
    }
};

export default optionalAuth;
