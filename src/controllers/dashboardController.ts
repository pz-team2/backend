import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Menggunakan Promise.all untuk menjalankan queries secara parallel
    const [totalUsers, totalEvents, totalOrganizers] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Organizer.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalEvents,
      totalOrganizers,
    };

    res
      .status(200)
      .json(
        apiResponse(true, "Berhasil mendapatkan statistik dashboard", stats)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan statistik dashboard", error));
  }
};
