import { Router } from "express";
import {
  getTicketsByUserId,
  getTicketByPaymentId,
  // addTicket,
  // updateTicket,
  // deleteTicket,
  deleteAllTickets,
  // getTickets,
} from "../controllers/ticketController";
import { protect } from "../middleware/authMiddleware";

const ticketRouter = Router();

// Ticket Component Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the ticket
 *         name:
 *           type: string
 *           description: Name of the ticket holder
 *         code:
 *           type: string
 *           description: Unique code for the ticket
 *         payment:
 *           type: string
 *           description: Reference to the payment associated with the ticket
 *         qrcode:
 *           type: string
 *           description: QR code for the ticket
 *         status:
 *           type: string
 *           enum: [active, used, cancelled]
 *           description: Current status of the ticket
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the ticket was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the ticket was last updated
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Retrieve all tickets for the authenticated user
 *     tags: [Ticket]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Tickets not found
 *       500:
 *         description: Server error
 */
ticketRouter.get("/", protect, getTicketsByUserId);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Retrieve a ticket by payment ID
 *     tags: [Ticket]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payment associated with the ticket
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
ticketRouter.get("/:id", getTicketByPaymentId);
// ticketRouter.get("/", getTickets);
// ticketRouter.post("/add", addTicket);
// ticketRouter.put("/:id", updateTicket);
// ticketRouter.delete("/:id", deleteTicket);

/**
 * @swagger
 * /api/tickets:
 *   delete:
 *     summary: Delete all tickets from the database
 *     tags: [Ticket]
 *     responses:
 *       200:
 *         description: All tickets successfully deleted
 *       404:
 *         description: No tickets found to delete
 *       500:
 *         description: Server error
 */
ticketRouter.delete("/", deleteAllTickets);

export default ticketRouter;
