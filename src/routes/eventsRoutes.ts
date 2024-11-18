import { Request, Response } from "express";
import { Router } from "express";
import {
  tambahEvent,
  getEventById,
  updateEvent,
  hapusEvent,
  getRecentEvents,
  getDataEventOrganizer,
  getEventsByRevenue,
  getEventsByOrganizer,
  getEventStats,
  getEvent,
} from "../controllers/eventController";
import upload from "../middleware/uploadFile";
import apiResponse from "../utils/apiResource";
import { searchEvents } from "../controllers/searchController";

const routerEvent = Router();

routerEvent.post(
  "/add/:id",
  upload.single("picture"),
  tambahEvent,
  (req: Request, res: Response): void => {
    if (req.file) {
      res
        .status(200)
        .json(apiResponse(true, "File Berhasil DI Upload", req.file));
    } else {
      res.status(400).json(apiResponse(false, "File Gagal Di Upload"));
    }
  }
);

routerEvent.get("/list", getEvent);
routerEvent.get("/detail/:id", getEventById);

//menampilkan data berdasarkan terbaru
routerEvent.get("/recent", getRecentEvents);
routerEvent.get("/dataterbaru", getDataEventOrganizer);
routerEvent.get("/listevent/:organizerId", getEventsByOrganizer);

// Menampilkan Event Berdasarkan Penghasilan
routerEvent.get("/event-by-revenue", getEventsByRevenue);

// Get Event Stats
routerEvent.get("/events-stats/:id", getEventStats);

routerEvent.delete("/delete/:id", hapusEvent);
routerEvent.get("/events", searchEvents);

routerEvent.put(
  "/update/:id",
  upload.single("picture"),
  updateEvent,
  (req: Request, res: Response): void => {
    if (req.file) {
      res
        .status(200)
        .json(apiResponse(true, "File Berhasil DI Upload", req.file));
    } else {
      res.status(400).json(apiResponse(false, "File Gagal Di Upload"));
    }
  }
);

export default routerEvent;
