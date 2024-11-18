import express from "express";
import { getDashboardStats, getDataUser } from "../controllers/dashboardController";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/data", getDataUser);

export default router;
