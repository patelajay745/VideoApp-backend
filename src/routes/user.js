import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutuser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory,
} from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
import multer from "multer";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
//router.post("/login", () => {});

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutuser);

router.post("/refresh-token", refreshAccessToken);

router.post("/change-password", verifyJWT, changeCurrentPassword);

router.get("/user", verifyJWT, getCurrentUser);

router.patch(
    "/updateUserAvatar",
    verifyJWT,
    upload.single({ name: "avatar", maxCount: 1 }),
    updateUserAvatar
);

router.get("/c/:username", getUserChannelProfile);
router.get("/history", verifyJWT, getWatchHistory);

export default router;
