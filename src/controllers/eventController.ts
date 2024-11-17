import { Request, Response } from "express";
import Event, { IEvent } from "../models/Event";
import apiResponse from "../utils/apiResource";
import Payment from "../models/Payment";
import moment from "moment-timezone";
import { SortOrder } from "mongoose";
const sanitizeHtml = require("sanitize-html");

export const tambahEvent = async (req: Request, res: Response) => {
  try {
    const organizerId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "File gambar diperlukan!" });
    }

    const {
      title,
      quota,
      price,
      startTime,
      finishTime,
      address,
      status,
      description,
      category,
    } = req.body;

    const sanitizedContent = sanitizeHtml(description, {
      allowedTags: ["b",
        "i",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "p",
        "br",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      allowedAttributes: {
        a: ["href", "target"],
      },
    });

    const jam = moment(req.body.date)
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");
    const picture = req.file ? req.file.path.replace(/\\/g, "/") : null;
    const newEvent = new Event({
      title,
      quota,
      price,
      startTime,
      finishTime,
      picture,
      date: jam,
      address,
      status,
      description: sanitizedContent,
      category,
      organizer: organizerId,
    });

    // Menyimpan event baru ke database
    await newEvent.save();

    // Mengirim response sukses
    res
      .status(200)
      .json(apiResponse(true, "Berhasil Menambahkan Data", newEvent));
  } catch (error) {
    // Menangani error dan mengirim response
    res.status(500).json(apiResponse(false, "Gagal Menambahkan Data", error));
  }
};

export const ambilEvent = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.status(200).json(apiResponse(true, "Event berhasil diambil", events));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Error saat mengambil Event", error));
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      // .populate("category", "name")
      // .populate("organizer", "organizerName email phoneNumber")

    if (!event) {
      return res.status(404).json(apiResponse(false, "Event tidak ditemukan"));
    }
    res.status(200).json(apiResponse(true, "Event berhasil diakses", event));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Error saat mengambil Event", error));
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      quota,
      price,
      startTime,
      finishTime,
      date,
      address,
      status,
      description,
      category,
    } = req.body;
    let picture = req.file?.path;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json(apiResponse(false, "Event tidak ditemukan"));
    }

    event.title = title;
    event.quota = quota;
    event.price = price;
    event.startTime = startTime;
    event.finishTime = finishTime;
    event.date = date;
    event.address = address;
    event.status = status;
    event.description = description;
    event.category = category;
    if (picture) {
      event.picture = picture;
    }

    await event.save();
    res.status(200).json(apiResponse(true, "Event berhasil diperbarui", event));
  } catch (error) {
    console.log(error)
    res.status(500).json(apiResponse(false, "Error memperbarui Event", error));
  }
};

export const hapusEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json(apiResponse(false, "Event tidak ditemukan"));
    }
    res.status(200).json(apiResponse(true, "Event berhasil dihapus", event));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Error saat menghapus Event", error));
  }
};

// Get Recent Events
export const getRecentEvents = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Event.countDocuments();

    // Get recent events
    const events = await Event.find()
      .sort({ createdAt: -1, date: -1 }) // Sort by creation date and event date
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name")
      .populate("organizer", "organizerName email phoneNumber")
      .exec();

    const lastPage = Math.ceil(total / Number(limit));

    const response = {
      data: events,
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
      .json(apiResponse(true, "Berhasil mendapatkan event terbaru", response));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan event terbaru", error));
  }
};

// Tipe Event yang sudah di-populate
interface PopulatedEvent extends Omit<IEvent, "organizer"> {
  organizer: {
    organizerName: string;
  };
}

export const getDataEventOrganizer = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate("organizer", "organizerName")
      .sort({ date: -1 });

    const eventData = await Promise.all(
      events.map(async (event) => {
        const tiketTerjual = await Payment.aggregate([
          { $match: { event: event._id, paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        const jam = moment(event.date)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss");

        return {
          id: event._id,
          title: event.title,
          picture: event.picture,
          date: jam,
          status: event.status,
          organizerName: (event.organizer as any)?.organizerName || "",
          ticketsSold: tiketTerjual[0]?.total || 0,
        };
      })
    );

    // Mengirim respons dengan format yang disederhanakan
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan event terbaru", eventData));
  } catch (error) {
    res
      .status(404)
      .json(apiResponse(false, "Gagal mendapatkan event terbaru", error));
  }
};

// Menampilkan Event Berdasarkan Penghasilan
export const getEventsByRevenue = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate("organizer", "organizerName")
      .sort({ date: -1 });

    const eventData = await Promise.all(
      events.map(async (event) => {
        // Menghitung tiket terjual dan total penghasilan (revenue) untuk setiap event
        const revenueData = await Payment.aggregate([
          { $match: { event: event._id, paymentStatus: "paid" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              totalTicketsSold: { $sum: "$quantity" },
            },
          },
        ]);

        const jam = moment(event.date)
          .tz("Asia/Jakarta")
          .format("YYYY-MM-DD HH:mm:ss");

        return {
          id: event._id,
          title: event.title,
          picture: event.picture,
          date: jam,
          status: event.status,
          organizerName: (event.organizer as any)?.organizerName || "",
          ticketsSold: revenueData[0]?.totalTicketsSold || 0,
          revenue: revenueData[0]?.totalRevenue || 0,
        };
      })
    );

    // Mengurutkan event berdasarkan penghasilan (revenue) tertinggi
    eventData.sort((a, b) => b.revenue - a.revenue);

    res
      .status(200)
      .json(
        apiResponse(
          true,
          "Berhasil mendapatkan event berdasarkan penghasilan",
          eventData
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        apiResponse(
          false,
          "Gagal mendapatkan event berdasarkan penghasilan",
          error
        )
      );
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
      limit = 6,
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

//
