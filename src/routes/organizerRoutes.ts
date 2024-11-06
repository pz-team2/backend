import { Router } from "express";
import {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
} from "../controllers/organizerController";
import { LoginOrganizer } from "../controllers/loginOrganizer";

const router = Router();

router.get("/", getOrganizers);
router.post("/add", createOrganizer);
router.get("/:id", getOrganizerById);
router.put("/:id", updateOrganizer);
router.delete("/:id", deleteOrganizer);
router.post("/login", LoginOrganizer);

export default router;
