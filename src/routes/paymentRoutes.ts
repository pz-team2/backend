import { Router } from "express";
import {
  deleteAllPayments,
  midtransNotification,
  payment,
  getUserTransactionHistory,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
const routerPayment = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the payment
 *         amount:
 *           type: number
 *           description: Total amount paid
 *         method:
 *           type: string
 *           description: Payment method used
 *         user:
 *           type: string
 *           description: User ID associated with the payment
 *         event:
 *           type: string
 *           description: Event ID associated with the payment
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed]
 *           description: Status of the payment
 *         quantity:
 *           type: number
 *           description: Number of tickets purchased
 *         order_id:
 *           type: string
 *           description: Order ID for the payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the payment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the payment was last updated
 */

/**
 * @swagger
 * /api/payments/data/{id}:
 *   post:
 *     summary: Create a new payment for an event
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Number of tickets to purchase
 *     responses:
 *       200:
 *         description: Successfully created payment
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
 *                     paymentToken:
 *                       type: string
 *                     redirectUrl:
 *                       type: string
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
routerPayment.post("/data/:id", protect, payment);

/**
 * @swagger
 * /api/payments/notifikasi:
 *   post:
 *     summary: Handle payment notification from Midtrans
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status_code:
 *                 type: integer
 *                 description: Status code from Midtrans
 *               order_id:
 *                 type: string
 *                 description: Order ID associated with the payment
 *     responses:
 *       200:
 *         description: Successfully processed notification
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
 *         description: Payment or event not found
 *       400:
 *         description: Invalid payment
 *       500:
 *         description: Server error
 */
routerPayment.post("/notifikasi", midtransNotification);

/**
 * @swagger
 * /api/payments/all:
 *   delete:
 *     summary: Delete all payment records
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Successfully deleted all payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: No payments found to delete
 *       500:
 *         description: Server error
 */
routerPayment.delete("/all", deleteAllPayments);

// Histori Transaksi
/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Retrieve transaction history for the authenticated user
 *     tags: [Payment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       404:
 *         description: No transactions found
 *       500:
 *         description: Server error
 */
routerPayment.get("/history", protect, getUserTransactionHistory);

export default routerPayment;
