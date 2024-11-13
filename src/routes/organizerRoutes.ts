import { Router } from "express";
import {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
  getEventsByOrganizer,
} from "../controllers/organizerController";
import { LoginOrganizer } from "../controllers/loginOrganizer";
import { searchEventsByOrganizer } from "../controllers/searchController";
import { protect } from "../middleware/middlewareOrganizer";

const router = Router();

router.get("/", getOrganizers);
router.post("/add",protect, createOrganizer);
router.get("/detail/:id", getOrganizerById);
router.put("/update/:id", updateOrganizer);
router.delete("/delete/:id", deleteOrganizer);
router.post("/login", LoginOrganizer);
router.get("/events/organizer/:organizerId", searchEventsByOrganizer);

router.get("/organizer/:organizerId", getEventsByOrganizer);
// router.get(
//   "/organizer/:organizerId/dashboard",
//   getOrganizerDashboard
// );

export default router;
