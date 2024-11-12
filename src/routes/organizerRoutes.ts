import { Router } from "express";
import {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
  getEventsByOrganizer,
  // getOrganizerDashboard,
} from "../controllers/organizerController";
import { LoginOrganizer } from "../controllers/loginOrganizer";
import { searchEventsByOrganizer } from "../controllers/searchController";

const router = Router();

router.get("/", getOrganizers);
router.post("/add", createOrganizer);
router.get("/:id", getOrganizerById);
router.put("/:id", updateOrganizer);
router.delete("/:id", deleteOrganizer);
router.post("/login", LoginOrganizer);
router.get("/events/organizer/:organizerId", searchEventsByOrganizer);

router.get("/organizer/:organizerId", getEventsByOrganizer);
// router.get(
//   "/organizer/:organizerId/dashboard",
//   getOrganizerDashboard
// );

export default router;
