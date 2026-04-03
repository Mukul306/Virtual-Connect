import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Middleware to run express-validator checks and return 422 on failure
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));

        throw new ApiError(422, "Validation failed.", extractedErrors);
    }

    next();
};

export default validate;
