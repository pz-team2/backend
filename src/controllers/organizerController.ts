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
      .json(apiResponse(true, "Berhasil mendapatkan Data Organizer", organizers, 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan organizer", error, 500));
  }
};

//Data Organizer Bedasarkan Role 
export const getOrganizerByRole = async (req: Request, res: Response) => {
  try {
    const organizer = await Organizer.find({ role: 'organizer' })

    res.status(200).json(apiResponse(false, "Data Berhasil", organizer, 200));

  } catch (error) {
    res.status(404).json(apiResponse(false, "Data Tidak Berhasil", error, 404))
  }
}

// Mendapatkan organizer berdasarkan ID
export const getOrganizerById = async (req: Request, res: Response) => {
  const organizerId = req.params.id;

  console.log("Organizer ID:", organizerId);
  try {
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer Tidak ditemukan", 404));
    }
    res
      .status(200)
      .json(apiResponse(true, "Berhasil Mendapatkan organizer", organizer, 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal Mendapatkan organizer", error, 500));
  }
};

export const getOrganizerByOne  = async (req: Request, res: Response) => {
  try {
    const organizerId = req.organizer.id;

    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.status(404).json(apiResponse(false, "Organizer not found", null, 404));
    }
    res
      .status(200)
      .json(apiResponse(true, "Successfully retrieved organizer", organizer, 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Failed to get organizer", error, 500));
  }
};


export const getEventsByOrganizerLatest = async (req: Request, res: Response) => {
  try {

    const organizerId = req.organizer.id;
    console.log(organizerId);

    const events = await Event.find({ organizer: organizerId })
      .populate("organizer", "organizerName")
      .sort({ date: -1 });

    console.log(events)
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
      .json(apiResponse(true, "Berhasil mendapatkan event terbaru", eventData, 200));
  } catch (error) {
    res
      .status(404)
      .json(apiResponse(false, "Gagal mendapatkan event terbaru", error, 404));
  }
};

// Menambahkan organizer baru
export const createOrganizer = async (req: Request, res: Response) => {
  const { username, phoneNumber, organizerName, email, password, role, status } =
    req.body;
  try {
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      return res
        .status(400)
        .json(apiResponse(false, 'Email sudah terdaftar', null, 400));
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const newOrganizer = new Organizer({
      username,
      phoneNumber,
      organizerName,
      status,
      email,
      password: hashpassword,
      role,
    });
    await newOrganizer.save();
    res
      .status(201)
      .json(apiResponse(true, "Organizer berhasil ditambahkan", newOrganizer, 201));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menambahkan organizer", error, 500));
  }
};

// Mengupdate data organizer
export const updateOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  const { username, phoneNumber, organizerName, email, status } = req.body;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { username, phoneNumber, organizerName, email, status },
      { new: true }
    );
    if (!updatedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan", 404));
    }
    res
      .status(200)
      .json(
        apiResponse(true, "Organizer berhasil diperbarui", updatedOrganizer, 200)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui organizer", error, 500));
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
        .json(apiResponse(false, "Organizer Tidak Di Temukan", 404));
    }

    const pw = await bcrypt.compare(password, datapassword.password);
    if (!pw) {
      return res
        .status(404)
        .json(apiResponse(false, "Password Yang Masukan Saat Ini Salah", 404));
    }

    if (pwbaru !== confirmpw) {
      res
        .status(505)
        .json(apiResponse(false, "Password Tidak Sama Ulangi !!!", 505));
    }

    const hashPw = await bcrypt.hash(pwbaru, 10);
    datapassword.password = hashPw;
    await datapassword.save();
    res.status(200).json(apiResponse(true, "Berhasil Update Password", 200));
  } catch (error) {
    console.log(error);
    res.status(505).json(apiResponse(false, "Gagal Update Password", error, 505));
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
        .json(apiResponse(false, "Organizer tidak ditemukan", 404));
    }
    res
      .status(200)
      .json(
        apiResponse(true, "Organizer berhasil diperbarui", updatedOrganizer, 200)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui organizer", error, 500));
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
        .json(apiResponse(false, "Organizer tidak ditemukan", 404));
    }
    res.status(200).json(apiResponse(true, "Organizer berhasil dihapus", 200));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menghapus organizer", error, 500));
  }
};

export const getEventsByOrganizer = async (req: Request, res: Response) => {
  try {
    const organizerId = req.organizer.id;
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
      .json(apiResponse(false, "Gagal mendapatkan event organizer", error, 500));
  }
};


// Get Organizer Stats
export const getOrganizerStats = async (req: Request, res: Response) => {
  try {
    const organizerId = req.organizer._id; // ID organizer dari middleware

    const events = await Event.find({ organizer: organizerId });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json(
          apiResponse(false, "Tidak ada event terkait dengan organizer ini", 404)
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
      .json(apiResponse(false, "Gagal mendapatkan data dashboard", error, 500));
  }
};
