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

router.post("/login", LoginOrganizer);
router.get("/", getOrganizers);
router.get('/getdata', getOrganizerByRole)
router.get('/getdataevent',protectOragnizer, getEventsByOrganizerLatest)
router.get('/profile',protectOragnizer, getOrganizerByOne)
router.post("/add", createOrganizer);
router.get("/detail/:id", getOrganizerById);
router.put("/update/:id", updateOrganizer);
router.put("/updateprofile", updateOrganizerById);
router.put("/updatepassword", updatepassword);
router.delete("/delete/:id", deleteOrganizer);
router.get("/events/:organizerId", searchEventsByOrganizer);
router.get("/event",protectOragnizer, getEventsByOrganizer);
router.get("/report", protectOragnizer, getOrganizerPaymentReport);

// Get Organizer Dashboard Stats
router.get("/organizer-stats", protectOragnizer, getOrganizerStats);

export default router;
