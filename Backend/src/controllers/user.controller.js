import httpStatus from "http-status";
import { Meeting } from "../models/meetingModel.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

/**
 * GET /api/v1/users/get_all_activity
 * Protected — uses req.user from auth middleware
 */
const getUserHistory = async (req, res, next) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.username }).sort({ date: -1 });
        return res
            .status(httpStatus.OK)
            .json(new ApiResponse(httpStatus.OK, "History fetched.", meetings));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/users/add_to_activity
 * Protected — uses req.user from auth middleware
 */
const addToHistory = async (req, res, next) => {
    try {
        const { meeting_code } = req.body;

        if (!meeting_code) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Meeting code is required.");
        }

        const newMeeting = new Meeting({
            user_id: req.user.username,
            meetingCode: meeting_code,
        });

        await newMeeting.save();

        return res
            .status(httpStatus.CREATED)
            .json(new ApiResponse(httpStatus.CREATED, "Added to history."));
    } catch (error) {
        next(error);
    }
};

export { getUserHistory, addToHistory };