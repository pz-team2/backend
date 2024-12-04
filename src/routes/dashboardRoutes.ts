import express from "express";
import { getDashboardStats, getDataUser } from "../controllers/dashboardController";
import { protectOragnizer } from "../middleware/middlewareOrganizer";

const router = express.Router();

router.get("/stats",protectOragnizer, getDashboardStats);
router.get("/data", getDataUser);

export default router;
