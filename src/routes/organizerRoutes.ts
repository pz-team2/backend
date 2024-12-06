import { Router } from "express";
import {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
  getEventsByOrganizer,
  getOrganizerStats,
  updateOrganizerById,
  updatepassword,
  getOrganizerByRole,
  getEventsByOrganizerLatest,
  getOrganizerByOne,
} from "../controllers/organizerController";
import { LoginOrganizer } from "../controllers/loginOrganizer";
import { searchEventsByOrganizer } from "../controllers/searchController";
import { protectOragnizer } from "../middleware/middlewareOrganizer";
import { getOrganizerPaymentReport } from "../controllers/paymentController";

const router = Router();

// Organizer Component Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Organizer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the organizer
 *         username:
 *           type: string
 *           description: Username of the organizer
 *         email:
 *           type: string
 *           description: Email address of the organizer
 *         password:
 *           type: string
 *           description: Hashed password of the organizer
 *         role:
 *           type: string
 *           enum: [organizer, admin]
 *           description: Role of the organizer
 *         status:
 *           type: string
 *           enum: [aktif, non-aktif]
 *           description: Account status of the organizer
 *         organizerName:
 *           type: string
 *           description: Name of the organizer or organization
 *         phoneNumber:
 *           type: number
 *           description: Contact phone number of the organizer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the organizer account was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the organizer account was last updated
 */

/**
 * @swagger
 * /api/organizers/login:
 *   post:
 *     summary: Login for organizers
 *     tags: [Organizer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Organizer's email address
 *                 example: organizer@example.com
 *               password:
 *                 type: string
 *                 description: Organizer's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Berhasil Login
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     role:
 *                       type: string
 *                       description: Role of the logged-in organizer
 *                       example: organizer
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email Tidak Ditemukan
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Terjadi Kesalahan Saat Login
 */
router.post("/login", LoginOrganizer);
router.get("/",protectOragnizer, getOrganizers);
router.get('/getdata',protectOragnizer, getOrganizerByRole)
router.get('/getdataevent',protectOragnizer, getEventsByOrganizerLatest)
router.get('/profile',protectOragnizer, getOrganizerByOne)
router.post("/add",protectOragnizer, createOrganizer);
router.get("/detail/:id",protectOragnizer, getOrganizerById);

/**
 * @swagger
 * /api/organizers/update/{id}:
 *   put:
 *     summary: Update an organizer by ID
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the organizer to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phoneNumber:
 *                 type: number
 *               organizerName:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       404:
 *         description: Organizer not found
 *       500:
 *         description: Server error
 */
router.put("/update/:id",protectOragnizer, updateOrganizer);

/**
 * @swagger
 * /api/organizers/updateprofile:
 *   put:
 *     summary: Update the profile of the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phoneNumber:
 *                 type: number
 *               organizerName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated organizer profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       404:
 *         description: Organizer not found
 *       500:
 *         description: Server error
 */
router.put("/updateprofile", protectOragnizer, updateOrganizerById);

/**
 * @swagger
 * /api/organizers/updatepassword:
 *   put:
 *     summary: Update password of the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
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
 *                 description: Confirmation of the new password
 *     responses:
 *       200:
 *         description: Successfully updated password
 *       404:
 *         description: Current password is incorrect
 *       500:
 *         description: Server error
 */
router.put("/updatepassword", protectOragnizer, updatepassword);
router.delete("/delete/:id",protectOragnizer, deleteOrganizer);
router.get("/events/:organizerId",protectOragnizer, searchEventsByOrganizer);
router.get("/event",protectOragnizer, getEventsByOrganizer);
router.get("/report", protectOragnizer, getOrganizerPaymentReport);

// Get Organizer Dashboard Stats
/**
 * @swagger
 * /api/organizers/organizer-stats:
 *   get:
 *     summary: Retrieve dashboard stats for the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenue:
 *                   type: number
 *                   description: Total revenue from events
 *                 transactions:
 *                   type: integer
 *                   description: Total number of transactions
 *                 ticketsSold:
 *                   type: integer
 *                   description: Total number of tickets sold
 *       404:
 *         description: No events found
 *       500:
 *         description: Server error
 */
router.get("/organizer-stats", protectOragnizer, getOrganizerStats);
export default router;
