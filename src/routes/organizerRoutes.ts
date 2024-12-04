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
router.get("/",protectOragnizer, getOrganizers);
router.get('/getdata',protectOragnizer, getOrganizerByRole)
router.get('/getdataevent',protectOragnizer, getEventsByOrganizerLatest)
router.get('/profile',protectOragnizer, getOrganizerByOne)
router.post("/add",protectOragnizer, createOrganizer);
router.get("/detail/:id", getOrganizerById);
router.put("/update/:id", updateOrganizer);
router.put("/updateprofile", protectOragnizer, updateOrganizerById);
router.put("/updatepassword", protectOragnizer, updatepassword);
router.delete("/delete/:id", protectOragnizer,deleteOrganizer);
router.get("/events/:organizerId",protectOragnizer, searchEventsByOrganizer);
router.get("/event",protectOragnizer, getEventsByOrganizer);
router.get("/report", protectOragnizer, getOrganizerPaymentReport);

// Get Organizer Dashboard Stats
router.get("/organizer-stats", protectOragnizer, getOrganizerStats);

export default router;
