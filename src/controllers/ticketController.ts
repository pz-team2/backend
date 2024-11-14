import { Request, Response } from "express";
import Ticket from "../models/Ticket";
import apiResponse from "../utils/apiResource";

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
      return res.status(404).json(apiResponse(false, "Tickets not found"));
    }

    res
      .status(200)
      .json(apiResponse(true, "Tickets retrieved successfully", tickets));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Error fetching tickets", error));
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
      return res.status(404).json(apiResponse(false, "Ticket not found"));
    }
    res.status(200).json(apiResponse(true, "Ticket found", ticket));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Error fetching ticket", error));
  }
};

// export const addTicket = async (req: Request, res: Response) => {
//   const { code, qrcode, payment } = req.body;
//   try {
//     const newTicket = new Ticket({
//       code,
//       qrcode,
//       payment,
//     });

//     await newTicket.save();
//     res
//       .status(201)
//       .json(apiResponse(true, "Ticket successfully created", newTicket));
//   } catch (error) {
//     res.status(500).json(apiResponse(false, "Error creating ticket", error));
//   }
// };

// export const updateTicket = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { code, qrcode, payment } = req.body;
//   try {
//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       id,
//       { code, qrcode, payment },
//       { new: true }
//     );
//     if (!updatedTicket) {
//       return res.status(404).json(apiResponse(false, "Ticket not found"));
//     }
//     res
//       .status(200)
//       .json(apiResponse(true, "Ticket successfully updated", updatedTicket));
//   } catch (error) {
//     res.status(500).json(apiResponse(false, "Error updating ticket", error));
//   }
// };

// export const deleteTicket = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const deletedTicket = await Ticket.findByIdAndDelete(id);
//     if (!deletedTicket) {
//       return res.status(404).json(apiResponse(false, "Ticket not found"));
//     }
//     res.status(200).json(apiResponse(true, "Ticket successfully deleted"));
//   } catch (error) {
//     res.status(500).json(apiResponse(false, "Error deleting ticket", error));
//   }
// };

export const deleteAllTickets = async (req: Request, res: Response) => {
  try {
    // Menghapus semua tiket
    const result = await Ticket.deleteMany();

    // Mengecek jika ada tiket yang terhapus
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json(apiResponse(false, "No tickets found to delete"));
    }

    res.status(200).json(apiResponse(true, "All tickets successfully deleted"));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Error deleting tickets", error));
  }
};
