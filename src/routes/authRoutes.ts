import { Router } from "express";
import { Register, Login, verifyEmail } from "../controllers/authController";
const router = Router();

router.post("/register", Register);
router.post("/login", Login);
router.get('/verify/:token', verifyEmail);

export default router;
