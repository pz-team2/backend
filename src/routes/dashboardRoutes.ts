import express from "express";
import {
  getDashboardStats,
  getDataUser,
} from "../controllers/dashboardController";

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Retrieve dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard statistics
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
 *                   example: Berhasil mendapatkan statistik dashboard
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       description: Total number of users
 *                       example: 120
 *                     totalEvents:
 *                       type: integer
 *                       description: Total number of events
 *                       example: 45
 *                     totalOrganizers:
 *                       type: integer
 *                       description: Total number of organizers
 *                       example: 15
 *       500:
 *         description: Failed to retrieve dashboard statistics
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
 *                   example: Gagal mendapatkan statistik dashboard
 */
router.get("/stats", getDashboardStats);

/**
 * @swagger
 * /api/dashboard/data:
 *   get:
 *     summary: Retrieve user data with filters and pagination
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by user status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *         description: Field to sort the results by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of users per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter users by category
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
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
 *                   example: Berhasil Mendapatkan Data User
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: User ID
 *                             example: 6312bcda912e3b0016a9f12e
 *                           username:
 *                             type: string
 *                             description: Username of the user
 *                             example: johndoe
 *                           email:
 *                             type: string
 *                             description: Email of the user
 *                             example: johndoe@example.com
 *                           category:
 *                             type: string
 *                             description: Category associated with the user
 *                             example: Technology
 *                           organizer:
 *                             type: string
 *                             description: Organizer associated with the user
 *                             example: TechCon 2023
 *                           totalTickets:
 *                             type: integer
 *                             description: Total number of tickets purchased by the user
 *                             example: 5
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of users matching the filters
 *                           example: 50
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         lastPage:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 9
 *                         hasNextPage:
 *                           type: boolean
 *                           description: Whether there is a next page
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           description: Whether there is a previous page
 *                           example: false
 *       404:
 *         description: No users found
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
 *                   example: Data Tidak Tersedia
 *       500:
 *         description: Failed to retrieve user data
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
 *                   example: Gagal mendapatkan histori data user
 */
router.get("/data", getDataUser);

export default router;
