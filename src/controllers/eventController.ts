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
      return res
        .status(400)
        .json(apiResponse(true, "File gambar diperlukan!", 400));
    }

    const maxSizeInBytes = 1000 * 1024 * 1024;
    if (req.file.size > maxSizeInBytes) {
      return res
        .status(400)
        .json(
          apiResponse(
            true,
            "Ukuran gambar terlalu besar! Maksimum 1000MB.",
            400
          )
        );
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
      allowedTags: [
        "b",
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
      .json(apiResponse(true, "Berhasil Menambahkan Data", newEvent, 200));
  } catch (error) {
    // Menangani error dan mengirim response
    console.log(error);
    res
      .status(500)
      .json(apiResponse(false, "Gagal Menambahkan Data", error, 500));
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const events = await Event.find()
      .populate("category", "name")
      .populate("organizer", "organizerName");
    res
      .status(200)
      .json(apiResponse(true, "Event berhasil diambil", events, 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Error saat mengambil Event", error, 500));
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("category", "name")
      .populate("organizer", "organizerName");

    if (!event) {
      return res
        .status(404)
        .json(apiResponse(false, "Event tidak ditemukan", 404));
    }
    res
      .status(200)
      .json(apiResponse(true, "Event berhasil diakses", event, 200));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Error saat mengambil Event", 500));
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
      return res
        .status(404)
        .json(apiResponse(false, "Event tidak ditemukan", 404));
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
    res
      .status(200)
      .json(apiResponse(true, "Event berhasil diperbarui", event, 200));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(apiResponse(false, "Error memperbarui Event", error, 500));
  }
};

export const hapusEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json(apiResponse(false, "Event tidak ditemukan", 404));
    }
    res
      .status(200)
      .json(apiResponse(true, "Event berhasil dihapus", event, 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Error saat menghapus Event", error, 500));
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
      .json(
        apiResponse(true, "Berhasil mendapatkan event terbaru", response, 200)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan event terbaru", error, 500));
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
      .json(
        apiResponse(true, "Berhasil mendapatkan event terbaru", eventData, 200)
      );
  } catch (error) {
    res
      .status(404)
      .json(apiResponse(false, "Gagal mendapatkan event terbaru", error, 404));
  }
};

// Menampilkan Event Berdasarkan Penghasilan
export const getEventByRevenue = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("organizer", "organizerName")
      .populate("category", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan",
      });
    }

    // Menghitung tiket terjual dan total penghasilan untuk event yang ditemukan
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

    const eventData = {
      id: event._id,
      title: event.title,
      picture: event.picture,
      date: jam,
      status: event.status,
      price: event.price,
      quota: event.quota,
      description: event.description,
      address: event.address,
      organizerName: (event.organizer as any)?.organizerName || "",
      categoryName: (event.category as any)?.name || "",
      ticketsSold: revenueData[0]?.totalTicketsSold || 0,
      revenue: revenueData[0]?.totalRevenue || 0,
    };

    // Mengembalikan detail event dalam format response JSON
    res
      .status(200)
      .json(
        apiResponse(
          true,
          "Berhasil mendapatkan detail event berdasarkan penghasilan",
          eventData,
          200
        )
      );
  } catch (error) {
    // Menangani error jika terjadi kegagalan
    console.log("Error: ", error);
    res
      .status(500)
      .json(
        apiResponse(
          true,
          "Tidak Berhasil mendapatkan detail event berdasarkan penghasilan",
          error,
          500
        )
      );
  }
};

export const getEventsByOrganizer = async (req: Request, res: Response) => {
  try {
    const organizerId = req.params.organizerId;
    // console.log("Searching for organizerId:", organizerId);

    const {
      status,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 9,
      category,
    } = req.query;

    // Build query
    let query: any = { organizer: organizerId };
    // console.log("Query:", query);

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

    // console.log("Found events:", events);

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
      .json(
        apiResponse(true, "Berhasil mendapatkan event organizer", response, 200)
      );
  } catch (error) {
    res
      .status(500)
      .json(
        apiResponse(false, "Gagal mendapatkan event organizer", error, 500)
      );
  }
};

// Event Stats
export const getEventStats = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId)
      .populate("organizer", "organizerName")
      .populate("category", "name");

    if (!event) {
      return res
        .status(404)
        .json(apiResponse(false, "Event tidak ditemukan", 404));
    }

    // Penghasilan
    const revenueData = await Payment.aggregate([
      { $match: { event: event._id, paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Tiket Terjual
    const ticketsSoldData = await Payment.aggregate([
      { $match: { event: event._id, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const ticketsSold = ticketsSoldData[0]?.total || 0;

    //  Tiket Tersisa
    const ticketsRemaining = event.quota - ticketsSold;

    res.status(200).json(
      apiResponse(true, "Berhasil mendapatkan detail event", {
        stats: {
          totalRevenue,
          ticketsSold,
          ticketsRemaining,
        },
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan detail event", error, 500));
  }
};
