import { Router } from "express";
import { addToHistory, getUserHistory } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/get_all_activity", authMiddleware, getUserHistory);
router.post("/add_to_activity", authMiddleware, addToHistory);

export default router;