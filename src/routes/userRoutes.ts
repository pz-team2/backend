import express, { Request, Response } from "express";
import {
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

// Endpoint untuk mendapatkan semua pengguna

router.get("/", getUsers);
router.get("/detail/:id", getUserById);
router.put("/:id/update", updateUser);
// router.get("/:id", authMiddleware, getProfile);
// router.patch("/update", authMiddleware, updateUserById);

export default router;
