import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.js";

const router = Router();
router.use(verifyJWT);

router.get("/stats", getChannelStats);
router.get("/videos", getChannelVideos);

export default router;
