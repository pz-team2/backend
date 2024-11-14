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
ticketRouter.get("/", protect, getTicketsByUserId);
ticketRouter.get("/:id", getTicketByPaymentId);
// ticketRouter.get("/", getTickets);
// ticketRouter.post("/add", addTicket);
// ticketRouter.put("/:id", updateTicket);
// ticketRouter.delete("/:id", deleteTicket);
ticketRouter.delete("/", deleteAllTickets);

export default ticketRouter;
