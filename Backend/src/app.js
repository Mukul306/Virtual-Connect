import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// ─── Security Middleware ─────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: config.clientUrl,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

// ─── Rate Limiting ───────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 auth requests per window (increased for testing)
    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/meeting", meetingRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is running." });
});

// ─── Central Error Handler (must be last) ─────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const start = async () => {
    try {
        await mongoose.connect(config.mongodbUrl);
        console.log("MongoDB connected successfully.");

        server.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};

start();