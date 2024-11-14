import { Router } from "express";
import {
  deleteAllPayments,
  midtransNotification,
  payment,
} from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
const routerPayment = Router();

routerPayment.post("/data/:id", protect, payment);
routerPayment.post("/notifikasi", midtransNotification);
routerPayment.delete("/all", deleteAllPayments);

export default routerPayment;
