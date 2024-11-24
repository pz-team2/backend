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
} from "../controllers/organizerController";
import { LoginOrganizer } from "../controllers/loginOrganizer";
import { searchEventsByOrganizer } from "../controllers/searchController";
import { protectOragnizer } from "../middleware/middlewareOrganizer";
import { protect } from "../middleware/authMiddleware";
import { getOrganizerPaymentReport } from "../controllers/paymentController";

const router = Router();

router.post("/login", LoginOrganizer);
router.get("/", getOrganizers);
router.post("/add", createOrganizer);
router.get("/detail/:id", getOrganizerById);
router.put("/update/:id", updateOrganizer);
router.put("/updateprofile", updateOrganizerById);
router.put("/updatepassword", updatepassword);
router.delete("/delete/:id", deleteOrganizer);
router.get("/events/organizer/:organizerId", searchEventsByOrganizer);
router.get("/organizer/:organizerId", getEventsByOrganizer);
router.get("/report", protectOragnizer, getOrganizerPaymentReport);

// Get Organizer Dashboard Stats
router.get("/organizer-stats", protectOragnizer, getOrganizerStats);

export default router;
