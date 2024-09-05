import { Router } from "express";
import { registerUser } from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "avtar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);
//router.post("/login", () => {});

export default router;
