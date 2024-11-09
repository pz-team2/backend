import express from "express";
import {
  searchUsers,
  searchEvents,
//   searchEventsByDateRange,
  searchEventsByOrganizer,
} from "../controllers/searchController";
// import { protect } from "../middleware/authMiddleware"; 

const router = express.Router();

// Routes untuk pencarian
router.get("/users", searchUsers);
router.get("/events", searchEvents); // Menambahkan protect
// router.get("/events/date-range", searchEventsByDateRange); 
router.get("/events/organizer/:organizerId", searchEventsByOrganizer);

export default router;
