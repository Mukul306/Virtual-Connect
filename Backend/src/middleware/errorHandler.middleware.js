import ApiError from "../utils/ApiError.js";
import config from "../config/index.js";

/**
 * Central error handler — catches all errors and returns consistent JSON
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = err;

    // If it's not an ApiError, wrap it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        ...(error.errors.length > 0 && { errors: error.errors }),
        ...(config.nodeEnv === "development" && { stack: error.stack }),
    };

    return res.status(error.statusCode).json(response);
};

export default errorHandler;
