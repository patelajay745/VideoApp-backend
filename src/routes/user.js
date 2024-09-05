import { Router } from "express";
import { registerUser } from "../controllers/user.js";

const router = Router();

router.post("/register", registerUser);
//router.post("/login", () => {});

export default router;
