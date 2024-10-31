import express, { Request, Response } from "express";
import {
  getUserById,
  getUsers,
  updateUserById,
} from "../controllers/userController";

const router = express.Router();

// Endpoint untuk mendapatkan semua pengguna

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id/update", updateUserById);
// router.get("/:id", authMiddleware, getProfile);
// router.patch("/update", authMiddleware, updateUserById);

export default router;
