import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutuser,
    refreshAccessToken,
} from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

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

export default router;
