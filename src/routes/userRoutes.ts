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

// User Component Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Unique username of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's hashed password
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the user
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the user
 *         city:
 *           type: string
 *           description: City of residence
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the user's email is verified
 *         emailToken:
 *           type: string
 *           description: Email verification token
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 */

// Endpoint untuk mendapatkan semua pengguna

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Failed to retrieve users
 */
router.get("/", getUsers);

/**
 * @swagger
 * /api/users/detail/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user data
 */
router.get("/detail/:id", protect, getUserById);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phoneNumber:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user data
 */
router.put("/update", protect, updateUser);
router.get("/users", searchUsers);

/**
 * @swagger
 * /api/users/updatePassword:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               pwbaru:
 *                 type: string
 *               confirmpw:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: User not found
 *       505:
 *         description: Failed to update password
 */
router.put("/updatePassword", protect, updatePassword);
// router.get("/:id", authMiddleware, getProfile);
// router.patch("/update", authMiddleware, updateUserById);

export default router;
