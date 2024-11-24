import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";
import Event from "../models/Event";
import Payment from "../models/Payment";
import bcrypt from "bcryptjs";
import { SortOrder } from "mongoose";
import moment from "moment-timezone";

// Mendapatkan semua organizer
export const getOrganizers = async (req: Request, res: Response) => {
  try {
    const organizers = await Organizer.find();
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan organizer", organizers));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan organizer", error));
  }
};

// Mendapatkan organizer berdasarkan ID
export const getOrganizerById = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  try {
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan organizer", organizer));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan organizer", error));
  }
};

// Menambahkan organizer baru
export const createOrganizer = async (req: Request, res: Response) => {
  const { username, phoneNumber, organizerName, email, password, role } =
    req.body;
  try {
    const hashpassword = await bcrypt.hash(password, 10);

    const newOrganizer = new Organizer({
      username,
      phoneNumber,
      organizerName,
      email,
      password: hashpassword,
      role,
    });
    await newOrganizer.save();
    res
      .status(201)
      .json(apiResponse(true, "Organizer berhasil ditambahkan", newOrganizer));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menambahkan organizer", error));
  }
};

// Mengupdate data organizer
export const updateOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  const { username, phoneNumber, organizerName, email } = req.body;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { username, phoneNumber, organizerName, email },
      { new: true }
    );
    if (!updatedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res
      .status(200)
      .json(
        apiResponse(true, "Organizer berhasil diperbarui", updatedOrganizer)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui organizer", error));
  }
};

export const updatepassword = async (req: Request, res: Response) => {
  try {
    const { password, pwbaru, confirmpw } = req.body;
    const organizerId = req.organizer.id;

    const datapassword = await Organizer.findById(organizerId);

    if (!datapassword) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer Tidak Di Temukan"));
    }

    const pw = await bcrypt.compare(password, datapassword.password);
    if (!pw) {
      return res
        .status(404)
        .json(apiResponse(false, "Password Yang Masukan Saat Ini Salah"));
    }

    if (pwbaru !== confirmpw) {
      res
        .status(505)
        .json(apiResponse(false, "Password Tidak Sama Ulangi !!!"));
    }

    const hashPw = await bcrypt.hash(pwbaru, 10);
    datapassword.password = hashPw;
    await datapassword.save();
    res.status(200).json(apiResponse(true, "Berhasil Update Password"));
  } catch (error) {
    console.log(error);
    res.status(505).json(apiResponse(false, "Gagal Update Password", error));
  }
};

export const updateOrganizerById = async (req: Request, res: Response) => {
  const organizerId = req.organizer.id;
  const { username, phoneNumber, organizerName, email } = req.body;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { username, phoneNumber, organizerName, email },
      { new: true }
    );
    if (!updatedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res
      .status(200)
      .json(
        apiResponse(true, "Organizer berhasil diperbarui", updatedOrganizer)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui organizer", error));
  }
};

// Menghapus organizer
export const deleteOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  try {
    const deletedOrganizer = await Organizer.findByIdAndDelete(organizerId);
    if (!deletedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res.status(200).json(apiResponse(true, "Organizer berhasil dihapus"));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menghapus organizer", error));
  }
};

export const getEventsByOrganizer = async (req: Request, res: Response) => {
  try {
    const organizerId = req.params.organizerId;
    console.log("Searching for organizerId:", organizerId);

    const {
      status,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      category,
    } = req.query;

    // Build query
    let query: any = { organizer: organizerId };
    console.log("Query:", query);

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Calculate skip for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    // Prepare sort object with proper typing
    const sortDirection: SortOrder = sortOrder === "desc" ? -1 : 1;
    const sortOptions: { [key: string]: SortOrder } = {
      [sortBy as string]: sortDirection,
    };

    // Get events with properly typed sort
    const events = await Event.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name")
      .populate("organizer", "organizerName email phoneNumber")
      .exec();

    console.log("Found events:", events);

    const lastPage = Math.ceil(total / Number(limit));

    // Get statistics for the organizer
    // const statistics = await Event.aggregate([
    //   { $match: { organizer: organizerId } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalEvents: { $sum: 1 },
    //       activeEvents: {
    //         $sum: {
    //           $cond: [{ $eq: ["$status", "active"] }, 1, 0],
    //         },
    //       },
    //       completedEvents: {
    //         $sum: {
    //           $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
    //         },
    //       },
    //       averagePrice: { $avg: "$price" },
    //       totalQuota: { $sum: "$quota" },
    //     },
    //   },
    // ]);
    // console.log("Statistics result:", statistics);

    const response = {
      data: events,
      // statistics: statistics[0] || {
      //   totalEvents: 0,
      //   activeEvents: 0,
      //   completedEvents: 0,
      //   averagePrice: 0,
      //   totalQuota: 0,
      // },
      pagination: {
        total,
        page: Number(page),
        lastPage,
        hasNextPage: Number(page) < lastPage,
        hasPrevPage: Number(page) > 1,
      },
    };

    res
      .status(200)
      .json(
        apiResponse(true, "Berhasil mendapatkan event organizer", response)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan event organizer", error));
  }
};

// Get Organizer Dashboard Summary
// export const getOrganizerDashboard = async (req: Request, res: Response) => {
//     try {
//         const organizerId = req.params.organizerId;

//         // Get upcoming events (next 7 days)
//         const nextWeek = new Date();
//         nextWeek.setDate(nextWeek.getDate() + 7);

//         const upcomingEvents = await Event.find({
//             organizer: organizerId,
//             date: {
//                 $gte: new Date(),
//                 $lte: nextWeek
//             }
//         }).populate('category', 'name');

//         // Get monthly event count
//         const monthlyEventCount = await Event.aggregate([
//             {
//                 $match: {
//                     organizer: organizerId
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         year: { $year: "$date" },
//                         month: { $month: "$date" }
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $sort: {
//                     "_id.year": -1,
//                     "_id.month": -1
//                 }
//             },
//             {
//                 $limit: 12
//             }
//         ]);

//         // Get category distribution
//         const categoryDistribution = await Event.aggregate([
//             {
//                 $match: {
//                     organizer: organizerId
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$category",
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "categories",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "categoryInfo"
//                 }
//             }
//         ]);

//         const dashboard = {
//             upcomingEvents,
//             monthlyEventCount,
//             categoryDistribution
//         };

//         res.status(200).json(
//             apiResponse(true, "Berhasil mendapatkan dashboard organizer", dashboard)
//         );
//     } catch (error) {
//         res.status(500).json(
//             apiResponse(false, "Gagal mendapatkan dashboard organizer", error)
//         );
//     }
// };

// Get Organizer Stats
export const getOrganizerStats = async (req: Request, res: Response) => {
  try {
    const organizerId = req.organizer._id; // ID organizer dari middleware

    const events = await Event.find({ organizer: organizerId });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json(
          apiResponse(false, "Tidak ada event terkait dengan organizer ini")
        );
    }

    const stats = await Payment.aggregate([
      {
        $match: {
          event: { $in: events.map((event) => event._id) },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          totalTicketsSold: { $sum: "$quantity" },
        },
      },
    ]);

    const result = stats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      totalTicketsSold: 0,
    };

    res.status(200).json(
      apiResponse(true, "Berhasil mendapatkan data dashboard", {
        revenue: result.totalRevenue,
        transactions: result.totalTransactions,
        ticketsSold: result.totalTicketsSold,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan data dashboard", error));
  }
};
