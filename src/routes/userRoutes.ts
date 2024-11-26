import express, { Request, Response } from "express";
import {
  getUserById,
  getUsers,
  updatePassword,
  updateUser,
} from "../controllers/userController";
import { searchUsers } from "../controllers/searchController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Endpoint untuk mendapatkan semua pengguna

router.get("/", getUsers);
router.get("/detail/:id", protect, getUserById);
router.put("/update", protect, updateUser);
router.get("/users", searchUsers);
router.put('/updatePassword',protect, updatePassword)
// router.get("/:id", authMiddleware, getProfile);
// router.patch("/update", authMiddleware, updateUserById);

export default router;
