import dotenv from "dotenv";
dotenv.config();

const config = {
    port: process.env.PORT || 8000,
    mongodbUrl: process.env.MONGODB_URL,
    jwtSecret: process.env.JWT_SECRET || "change-this-to-a-strong-secret",
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
