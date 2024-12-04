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
import { protect } from "../middleware/authMiddleware";
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

/**
 * @swagger
 * /api/organizers:
 *   get:
 *     summary: Retrieve all organizers
 *     tags: [Organizer]
 *     responses:
 *       200:
 *         description: Successfully retrieved all organizers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organizer'
 *       500:
 *         description: Server error
 */
router.get("/", getOrganizers);

/**
 * @swagger
 * /api/organizers/getdata:
 *   get:
 *     summary: Retrieve all organizers with role "organizer"
 *     tags: [Organizer]
 *     responses:
 *       200:
 *         description: Successfully retrieved organizers by role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organizer'
 *       404:
 *         description: No organizers found
 */
router.get("/getdata", getOrganizerByRole);

/**
 * @swagger
 * /api/organizers/getdataevent:
 *   get:
 *     summary: Retrieve the latest events created by the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved latest events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   picture:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                   organizerName:
 *                     type: string
 *                   ticketsSold:
 *                     type: integer
 *       404:
 *         description: No events found
 */
router.get("/getdataevent", protectOragnizer, getEventsByOrganizerLatest);

/**
 * @swagger
 * /api/organizers/profile:
 *   get:
 *     summary: Retrieve profile of the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       404:
 *         description: Organizer not found
 *       500:
 *         description: Server error
 */
router.get("/profile", protectOragnizer, getOrganizerByOne);

/**
 * @swagger
 * /api/organizers/add:
 *   post:
 *     summary: Create a new organizer
 *     tags: [Organizer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Organizer'
 *     responses:
 *       201:
 *         description: Successfully created a new organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post("/add", createOrganizer);

/**
 * @swagger
 * /api/organizers/detail/{id}:
 *   get:
 *     summary: Retrieve organizer details by ID
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the organizer
 *     responses:
 *       200:
 *         description: Successfully retrieved organizer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       404:
 *         description: Organizer not found
 *       500:
 *         description: Server error
 */
router.get("/detail/:id", getOrganizerById);

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
router.put("/update/:id", updateOrganizer);

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

/**
 * @swagger
 * /api/organizers/delete/{id}:
 *   delete:
 *     summary: Delete an organizer by ID
 *     tags: [Organizer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the organizer to delete
 *     responses:
 *       200:
 *         description: Successfully deleted organizer
 *       404:
 *         description: Organizer not found
 *       500:
 *         description: Server error
 */
router.delete("/delete/:id", deleteOrganizer);

/**
 * @swagger
 * /api/search/events/organizer/{organizerId}:
 *   get:
 *     summary: Search events created by a specific organizer
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organizer ID to filter events
 *     responses:
 *       200:
 *         description: Successfully searched events by organizer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: Organizer ID is required
 *       500:
 *         description: Server error
 */
router.get("/events/:organizerId", searchEventsByOrganizer);

/**
 * @swagger
 * /api/organizers/event:
 *   get:
 *     summary: Retrieve all events created by the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter events by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events starting after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events ending before this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of events per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Successfully retrieved events for the authenticated organizer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       category:
 *                         type: string
 *                       organizerName:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     lastPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       404:
 *         description: No events found
 *       500:
 *         description: Server error
 */
router.get("/event", protectOragnizer, getEventsByOrganizer);

/**
 * @swagger
 * /api/organizers/report:
 *   get:
 *     summary: Get a payment report for the authenticated organizer
 *     tags: [Organizer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved payment report
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
 *         description: No payment data found
 *       500:
 *         description: Server error
 */
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
