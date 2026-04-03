import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { User } from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
} from "../utils/tokenUtils.js";
import config from "../config/index.js";

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new ApiError(httpStatus.CONFLICT, "Username already taken.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        return res
            .status(httpStatus.CREATED)
            .json(new ApiResponse(httpStatus.CREATED, "User registered successfully."));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store hashed refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token as HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, "Login successful.", {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                },
            })
        );
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token from DB
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        // Clear cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "strict" : "lax",
        });

        return res
            .status(httpStatus.OK)
            .json(new ApiResponse(httpStatus.OK, "Logged out successfully."));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    return res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, "User fetched successfully.", {
            user: req.user,
        })
    );
};

/**
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token provided.");
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token.");
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id);

        // Optionally rotate refresh token
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === "production",
            sameSite: config.nodeEnv === "production" ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, "Token refreshed.", { accessToken })
        );
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new ApiError(httpStatus.UNAUTHORIZED, "Refresh token expired. Please login again."));
        }
        next(error);
    }
};

export { register, login, logout, getMe, refreshAccessToken };
