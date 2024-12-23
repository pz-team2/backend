import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import apiResponse from "../utils/apiResource";
import Event from "../models/Event";

// export const getTickets = async (req: Request, res: Response) => {
//   try {
//     // Cari tiket yang terkait dengan ID user yang ada di tabel Payment
//     const tickets = await Ticket.find()
//       .populate({
//         path: "payment",
//         populate: {
//           path: "event",
//           select:
//             "title date address description status startTime finishTime picture",
//         },
//       })
//       .then((tickets) => tickets.filter((ticket) => ticket.payment !== null)); // Filter tiket yang memiliki payment

//     // Jika tidak ada tiket
//     if (tickets.length === 0) {
//       return res.status(404).json(apiResponse(false, "Tickets not found"));
//     }

//     res
//       .status(200)
//       .json(apiResponse(true, "Tickets retrieved successfully", tickets));
//   } catch (error) {
//     res.status(500).json(apiResponse(false, "Error fetching tickets", error));
//   }
// };

export const getTicketsByUserId = async (req: Request, res: Response) => {
  try {
    // Cari tiket yang terkait dengan ID user yang ada di tabel Payment
    const tickets = await Ticket.find()
      .populate({
        path: "payment",
        match: { user: req.user._id }, // Filter pembayaran berdasarkan ID pengguna
        select: "_id",
        populate: [
          {
            path: "event", // Populasi eventId untuk mengambil data dari Event
            select:
              "title date address description status startTime finishTime picture",
          },
          {
            path: "user", // Populasi userId untuk mengambil data dari User
            select: "fullname email username", // Anda bisa sesuaikan field yang ingin diambil
          },
        ],
      })
      .then((tickets) => tickets.filter((ticket) => ticket.payment !== null)); // Filter tiket yang memiliki payment

    // Jika tidak ada tiket
    if (tickets.length === 0) {
      return res.json(apiResponse(false, "Tickets not found",null, 404));
    }

    res
      .json(apiResponse(true, "Tickets retrieved successfully", tickets, 200));
  } catch (error) {
    res.json(apiResponse(false, "Error fetching tickets", error, 500));
  }
};

export const getTicketByPaymentId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const ticket = await Ticket.find({ payment: id }).populate({
      path: "payment", // Populasi paymentId untuk mengambil data dari Payment
      populate: [
        {
          path: "event", // Populasi eventId untuk mengambil data dari Event
          select:
            "title date address description status startTime finishTime picture",
        },
        {
          path: "user", // Populasi userId untuk mengambil data dari User
          select: "fullname email username", // Anda bisa sesuaikan field yang ingin diambil
        },
      ],
    });

    if (!ticket) {
      return res.json(apiResponse(false, "Ticket not found", null, 404));
    }
    res.json(apiResponse(true, "Ticket found", ticket, 200));
  } catch (error) {
    res.json(apiResponse(false, "Error fetching ticket", error, 500));
  }
};

export const deleteAllTickets = async (req: Request, res: Response) => {
  try {
    // Menghapus semua tiket
    const result = await Ticket.deleteMany();

    // Mengecek jika ada tiket yang terhapus
    if (result.deletedCount === 0) {
      return res
        .json(apiResponse(false, "No tickets found to delete", null, 400));
    }

    res.json(apiResponse(true, "All tickets successfully deleted", 200));
  } catch (error) {
    res.json(apiResponse(false, "Error deleting tickets", error, 500));
  }
};

// Controller untuk menampilkan tiket berdasarkan eventId
export const getTicketsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    
    // Cek apakah event dengan ID tersebut ada
    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.json(apiResponse(false, "Event tidak ditemukan", null, 404));
    }

    // Ambil semua tiket berdasarkan eventId
    const tickets = await Ticket.find()
      .populate({
        path: "payment",
        match: { event: eventId }, // Filter berdasarkan event
        populate: { path: "user", select: "fullName email" }, // Menampilkan info user
      });

    // Filter tiket yang memiliki payment dengan event sesuai
    const filteredTickets = tickets.filter((ticket) => ticket.payment !== null);

    // Cek jika tidak ada tiket yang ditemukan
    if (filteredTickets.length === 0) {
      return res.json(apiResponse(false, "Data tiket tidak tersedia", null, 404));
    }

    // Jika tiket ditemukan
    res.json(apiResponse(true, "Data tiket berhasil diambil", { tickets: filteredTickets }, 200));
  } catch (error) {
    console.error(error);
    res.json(apiResponse(false, "Gagal mengambil data tiket", error, 500));
  }
};
// Controller untuk mengupdate status tiket menjadi "used"
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    // Cari tiket berdasarkan ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res .json(apiResponse(false,"Tiket tidak ditemukan" , null, 500));
    }

    // Update status tiket menjadi "used"
    ticket.status = "USED";
    await ticket.save();

    res .json(apiResponse(true, "Status Ticket Berhasil Di perbaharui ", ticket, 200));
  } catch (error) {
    console.error(error);
    res.json(apiResponse(false,"Gagal mengupdate status tiket" , error, 500));
  }
};
