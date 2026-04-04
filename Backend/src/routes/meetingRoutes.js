import { Router } from "express";
import { generateMeeting, joinMeeting, getUserMeetings, deleteMeeting } from "../controllers/meeting.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optionalAuth from "../middleware/optionalAuth.middleware.js";

const router = Router();

router.post("/generate", authMiddleware, generateMeeting);
router.post("/join", optionalAuth, joinMeeting);
router.get("/my-meetings", authMiddleware, getUserMeetings);
router.delete("/:id", authMiddleware, deleteMeeting);

export default router;
