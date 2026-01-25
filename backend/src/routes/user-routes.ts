import { Router } from "express";
import { signup, login, logout, authStatus } from "../controllers/user-controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/auth-status", authMiddleware, authStatus);

export default router;
