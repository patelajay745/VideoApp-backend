import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createTweet);
router.get("/user/:userID", getUserTweets);
router.delete("/:tweetId", deleteTweet);
router.patch("/:tweetId", updateTweet);

export default router;
