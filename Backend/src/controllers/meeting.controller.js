import httpStatus from "http-status";
import { nanoid } from "nanoid";
import { Meeting } from "../models/meetingModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Generate a meeting code in format: abc-defg-hij
 */
const generateMeetingCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const pick = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${pick(3)}-${pick(4)}-${pick(3)}`;
};

/**
 * POST /api/meeting/generate
 * Protected — creates a new meeting with unique code
 */
const generateMeeting = async (req, res, next) => {
    try {
        let meetingCode;
        let exists = true;

        // Ensure unique code
        while (exists) {
            meetingCode = generateMeetingCode();
            exists = await Meeting.findOne({ meetingCode });
        }

        const meeting = new Meeting({
            meetingCode,
            host: req.user._id,
            hostName: req.user.name || req.user.username,
        });

        await meeting.save();

        return res.status(httpStatus.CREATED).json(
            new ApiResponse(httpStatus.CREATED, "Meeting created.", {
                meetingCode: meeting.meetingCode,
                hostName: meeting.hostName,
                createdAt: meeting.createdAt,
            })
        );
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/meeting/join
 * Optional auth — validates that meeting code exists
 */
const joinMeeting = async (req, res, next) => {
    try {
        const { meetingCode } = req.body;

        if (!meetingCode) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Meeting code is required.");
        }

        const meeting = await Meeting.findOne({ meetingCode: meetingCode.toLowerCase().trim() });

        if (!meeting) {
            throw new ApiError(httpStatus.NOT_FOUND, "Meeting not found. Please check the code and try again.");
        }

        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, "Meeting found.", {
                meetingCode: meeting.meetingCode,
                hostName: meeting.hostName,
                createdAt: meeting.createdAt,
            })
        );
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/meeting/my-meetings
 * Protected — get meetings created by the user
 */
const getUserMeetings = async (req, res, next) => {
    try {
        const meetings = await Meeting.find({ host: req.user._id })
            .sort({ createdAt: -1 })
            .select("meetingCode hostName createdAt");

        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, "Meetings fetched.", meetings)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/meeting/:id
 * Protected — delete a meeting from user's history
 */
const deleteMeeting = async (req, res, next) => {
    try {
        const meetingId = req.params.id;

        if (!meetingId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Meeting ID is required.");
        }

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            throw new ApiError(httpStatus.NOT_FOUND, "Meeting not found.");
        }

        // Verify the user owns the meeting
        if (meeting.host.toString() !== req.user._id.toString()) {
            throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to delete this meeting.");
        }

        await Meeting.findByIdAndDelete(meetingId);

        return res.status(httpStatus.OK).json(
            new ApiResponse(httpStatus.OK, "Meeting deleted successfully.")
        );
    } catch (error) {
        next(error);
    }
};

export { generateMeeting, joinMeeting, getUserMeetings, deleteMeeting };
