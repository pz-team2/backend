import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";

// Search Users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .json(apiResponse(false, "Query pencarian diperlukan", null, 400));
    }

    const searchQuery = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } },
      ],
    };

    const users = await User.find(searchQuery).select("-password").limit(10);

    res.json(apiResponse(true, "Berhasil mencari users", users, 200));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal melakukan pencarian users", error, 500));
  }
};

// Search Events with Advanced Filters
export const searchEvents = async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice, date, status, organizer } =
      req.query;

    let searchQuery: any = {};

    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice) searchQuery.price.$lte = Number(maxPrice);
    }

    // Date filter
    if (date) {
      searchQuery.date = new Date(date as string);
    }

    // Status filter
    if (status) {
      searchQuery.status = status;
    }

    // Organizer filter
    if (organizer) {
      searchQuery.organizer = organizer;
    }

    const events = await Event.find(searchQuery)
      .populate("category", "name")
      .populate("organizer", "organizerName")
      .limit(10);

    res.json(apiResponse(true, "Berhasil mencari events", events, 200));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal melakukan pencarian events", error, 500));
  }
};

// Search Events by Organizer
export const searchEventsByOrganizer = async (req: Request, res: Response) => {
  try {
    const { organizerId } = req.params;

    if (!organizerId) {
      return res
        .json(apiResponse(false, "ID Organizer diperlukan", 400));
    }

    const events = await Event.find({ organizer: organizerId })
      .populate("category", "name")
      .populate("organizer", "organizerName")
      .sort({ date: -1 }); 

    res
      .json(
        apiResponse(
          true,
          "Berhasil mencari events berdasarkan organizer",
          events, 200
        )
      );
  } catch (error) {
    res
      .json(
        apiResponse(
          false,
          "Gagal melakukan pencarian events by organizer",
          error, 500
        )
      );
  }
};
