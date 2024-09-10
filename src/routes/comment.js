import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
    addComment,
    getVideoComments,
    deleteComment,
    updateComment,
} from "../controllers/comment.js";
const router = Router();

router.use(verifyJWT);

router.get("/:videoId", getVideoComments);
router.post("/:videoId", addComment);

router.delete("/c/:commentId", deleteComment);
router.patch("/c/:commentId", updateComment);

export default router;
