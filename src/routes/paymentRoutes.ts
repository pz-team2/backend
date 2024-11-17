import { Router } from "express";
import {
  deleteAllPayments,
  midtransNotification,
  payment,
  getUserTransactionHistory,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
const routerPayment = Router();

routerPayment.post("/data/:id", protect, payment);
routerPayment.post("/notifikasi", midtransNotification);
routerPayment.delete("/all", deleteAllPayments);

// Histori Transaksi
routerPayment.get("/history", protect, getUserTransactionHistory);

export default routerPayment;
