import { Router } from "express";
import { midtransNotification, payment } from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";
const routerPayment = Router();

routerPayment.post('/data/:id', protect, payment)
routerPayment.post('/notifikasi', midtransNotification)


export default routerPayment;