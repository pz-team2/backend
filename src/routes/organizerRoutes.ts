import { Router } from "express";
import {
  createOrganizer,
  getOrganizers,
  getOrganizerById,
  updateOrganizer,
  deleteOrganizer,
} from "../controllers/organizerController";

const router = Router();

router.get("/", getOrganizers);
router.post("/add", createOrganizer);
router.get("/:id", getOrganizerById);
router.put("/:id", updateOrganizer);
router.delete("/:id", deleteOrganizer);

export default router;
