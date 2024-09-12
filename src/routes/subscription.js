import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
    getSubscribedChannels,
    toggleSubscription,
    getUserChannelSubscribers,
} from "../controllers/subscription.js";

const router = Router();
router.use(verifyJWT);

router.get("/c/:channelId", getSubscribedChannels);
router.post("/c/:channelId", toggleSubscription);

router.get("/u/:subscriberId", getUserChannelSubscribers);

export default router;
