import { Request, Response } from "express";
import { Router } from "express";
import {
  tambahEvent,
  getEventById,
  updateEvent,
  hapusEvent,
  getRecentEvents,
  getDataEventOrganizer,
  getEventsByRevenue,
  getEventsByOrganizer,
  getEventStats,
  getEvent,
} from "../controllers/eventController";
import upload from "../middleware/uploadFile";
import apiResponse from "../utils/apiResource";
import { searchEvents } from "../controllers/searchController";

const routerEvent = Router();

// Event Component Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - address
 *         - description
 *         - status
 *         - quota
 *         - price
 *         - startTime
 *         - finishTime
 *         - organizer
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the event
 *         title:
 *           type: string
 *           description: Title of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the event
 *         address:
 *           type: string
 *           description: Location of the event
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         status:
 *           type: string
 *           description: Status of the event (e.g., "active", "cancelled")
 *         quota:
 *           type: integer
 *           description: Maximum number of participants allowed
 *         price:
 *           type: number
 *           description: Price of the event ticket
 *         startTime:
 *           type: string
 *           description: Start time of the event
 *         finishTime:
 *           type: string
 *           description: End time of the event
 *         picture:
 *           type: string
 *           description: URL of the event's picture
 *         organizer:
 *           type: string
 *           description: Reference to the organizer ID
 *         category:
 *           type: string
 *           description: Reference to the category ID
 *       example:
 *         _id: "639f3c5b9b093e5f23e9f4e1"
 *         title: "Tech Conference 2024"
 *         date: "2024-12-01T10:00:00Z"
 *         address: "123 Event Street, Jakarta"
 *         description: "A conference about the latest in technology."
 *         status: "active"
 *         quota: 100
 *         price: 150000
 *         startTime: "10:00"
 *         finishTime: "17:00"
 *         picture: "uploads/event-12345.jpg"
 *         organizer: "62d2f7b2a3e4a9b1f7f0c5d3"
 *         category: "63f2b3c1a4e9c5d6e5f7f0b3"
 */

/**
 * @swagger
 * /api/events/add/{id}:
 *   post:
 *     summary: Add a new event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the organizer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               quota:
 *                 type: integer
 *               price:
 *                 type: number
 *               startTime:
 *                 type: string
 *               finishTime:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request
 */
routerEvent.post(
  "/add/:id",
  upload.single("picture"),
  tambahEvent,
  (req: Request, res: Response): void => {
    if (req.file) {
      res
        .status(200)
        .json(apiResponse(true, "File Berhasil DI Upload", req.file));
    } else {
      res.status(400).json(apiResponse(false, "File Gagal Di Upload"));
    }
  }
);

/**
 * @swagger
 * /api/events/list:
 *   get:
 *     summary: Get all events
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
routerEvent.get("/list", getEvent);

/**
 * @swagger
 * /api/events/detail/{id}:
 *   get:
 *     summary: Get event details by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
routerEvent.get("/detail/:id", getEventById);

//menampilkan data berdasarkan terbaru
/**
 * @swagger
 * /api/events/recent:
 *   get:
 *     summary: Get recent events
 *     tags: [Event]
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Recent events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
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
 *       500:
 *         description: Failed to retrieve events
 */
routerEvent.get("/recent", getRecentEvents);

/**
 * @swagger
 * /api/events/dataterbaru:
 *   get:
 *     summary: Get events with data organized by the organizer
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *       500:
 *         description: Failed to retrieve events
 */
routerEvent.get("/dataterbaru", getDataEventOrganizer);

/**
 * @swagger
 * /api/events/listevent/{organizerId}:
 *   get:
 *     summary: Get events organized by a specific organizer
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: organizerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the organizer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by event status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by events starting after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by events ending before this date
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
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
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
 *       500:
 *         description: Failed to retrieve events
 */
routerEvent.get("/listevent/:organizerId", getEventsByOrganizer);

// Menampilkan Event Berdasarkan Penghasilan
/**
 * @swagger
 * /api/events/event-by-revenue:
 *   get:
 *     summary: Get events sorted by revenue
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                   revenue:
 *                     type: number
 *       500:
 *         description: Failed to retrieve events
 */
routerEvent.get("/event-by-revenue", getEventsByRevenue);

// Get Event Stats
/**
 * @swagger
 * /api/events/events-stats/{id}:
 *   get:
 *     summary: Get statistics for an event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       description: Total revenue from the event
 *                     ticketsSold:
 *                       type: integer
 *                       description: Total number of tickets sold
 *                     ticketsRemaining:
 *                       type: integer
 *                       description: Number of tickets still available
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to retrieve event statistics
 */
routerEvent.get("/events-stats/:id", getEventStats);

/**
 * @swagger
 * /api/events/delete/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to delete the event
 */
routerEvent.delete("/delete/:id", hapusEvent);

/**
 * @swagger
 * /api/events/events:
 *   get:
 *     summary: Search events with advanced filters
 *     tags: [Event]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (title, description, or address)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price for events
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price for events
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by event date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by event status
 *       - in: query
 *         name: organizer
 *         schema:
 *           type: string
 *         description: Filter by organizer ID
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Failed to search for events
 */
routerEvent.get("/events", searchEvents);

/**
 * @swagger
 * /api/events/update/{id}:
 *   put:
 *     summary: Update an existing event
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               quota:
 *                 type: integer
 *               price:
 *                 type: number
 *               startTime:
 *                 type: string
 *               finishTime:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               address:
 *                 type: string
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Failed to update the event
 */
routerEvent.put(
  "/update/:id",
  upload.single("picture"),
  updateEvent,
  (req: Request, res: Response): void => {
    if (req.file) {
      res
        .status(200)
        .json(apiResponse(true, "File Berhasil DI Upload", req.file));
    } else {
      res.status(400).json(apiResponse(false, "File Gagal Di Upload"));
    }
  }
);

export default routerEvent;
