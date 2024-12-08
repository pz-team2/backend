import express, { Request, Response } from "express";
import {
  getUserById,
  getUsers,
  updatePassword,
  updateUser,
} from "../controllers/userController";
import { searchUsers } from "../controllers/searchController";
import { protect } from "../middleware/authMiddleware";
import { protectOragnizer } from "../middleware/middlewareOrganizer";

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
 *     security:
 *       - bearerAuth: []
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
 *                         $ref: '#/components/schemas/User'
 *       403:
 *         description: Unauthorized access
 *       500:
 *         description: Failed to retrieve users
 */
router.get("/", protectOragnizer, getUsers);

/**
 * @swagger
 * /api/users/detail/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
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
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user data
 */
router.get("/detail", protect, getUserById);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user data
 */
router.put("/update", protect, updateUser);

/**
 * @swagger
 * /api/search/users:
 *   get:
 *     summary: Search users based on username, email, fullName, or city
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Query string for searching users
 *     responses:
 *       200:
 *         description: Successfully searched users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Query parameter is required
 *       500:
 *         description: Server error
 */
router.get("/users", searchUsers);

/**
 * @swagger
 * /api/users/updatePassword:
 *   put:
 *     summary: Update user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Current password
 *               pwbaru:
 *                 type: string
 *                 description: New password
 *               confirmpw:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update password
 */
router.put("/updatePassword", protect, updatePassword);
// router.get("/:id", authMiddleware, getProfile);
// router.patch("/update", authMiddleware, updateUserById);

export default router;
