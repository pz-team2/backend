import { Request, Response } from "express";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";
import Payment from "../models/Payment";
import snap from "../utils/midtranst";
import Ticket from "../models/Ticket";
import QRCode from "qrcode";

export const getOrganizerPaymentReport = async (
  req: Request,
  res: Response
) => {
  try {
    // Langkah 1: Cari semua event berdasarkan organizer
    const events = await Event.find({ organizer: req.organizer._id })
      .populate("organizer", "organizerName email") // Hanya ambil field tertentu
      .select("_id title date");

    console.log(events);

    if (!events.length) {
      return res
        .status(404)
        .json(
          apiResponse(false, "Tidak ada event ditemukan untuk organizer ini")
        );
    }

    const eventIds = events.map((event) => event._id);

    const monthlySales = await Payment.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          ticketsSold: { $sum: "$quantity" }, // Total tiket terjual per bulan
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Normalize data untuk memastikan semua bulan muncul (Januari-Desember)
    const normalizedSales = [];
    for (let month = 1; month <= 12; month++) {
      const found = monthlySales.find((sale) => sale._id.month === month);
      normalizedSales.push({
        year: found?._id.year || new Date().getFullYear(), // Gunakan tahun transaksi atau tahun sekarang
        month: monthNames[month - 1], // Ambil nama bulan dari array
        ticketsSold: found ? found.ticketsSold : 0, // Default 0 jika tidak ada transaksi
      });
    }

    // Langkah 4: Hitung total payment, transaksi, dan tiket terjual
    const report = await Payment.aggregate([
      {
        $match: {
          event: { $in: eventIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalPayment: { $sum: "$amount" }, // Total pembayaran
          totalTransactions: { $sum: 1 }, // Total transaksi
          totalTicketsSold: { $sum: "$quantity" }, // Total tiket terjual
        },
      },
    ]);

    // Format hasil report
    const result = {
      totalPayment: report[0]?.totalPayment || 0,
      totalTransactions: report[0]?.totalTransactions || 0,
      totalTicketsSold: report[0]?.totalTicketsSold || 0,
      monthlySales: normalizedSales,
    };



    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan laporan", result));
  } catch (error) {
    res
      .status(500)
      .json(
        apiResponse(false, "Terjadi kesalahan saat mendapatkan laporan", error)
      );
  }
};

const generateUniqueTicketCode = async (): Promise<string> => {
  let isUnique = false;
  let ticketCode = "";

  while (!isUnique) {
    ticketCode = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const existingTicket = await Ticket.findOne({ code: ticketCode });
    if (!existingTicket) {
      isUnique = true;
    }
  }

  return ticketCode;
};

export const payment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    return res
      .status(404)
      .json(apiResponse(false, "Event Tidak Ditemukan", null));
  }

  try {
    const { quantity } = req.body;
    const amount = event.price * quantity;
    const order_id = `order-${Date.now()}`;

    const newPayment = new Payment({
      user: req.user._id,
      event: event._id,
      amount: amount,
      quantity,
      order_id: order_id,
      paymentStatus: "pending",
    });
    await newPayment.save();

    const transactionParams = {
      transaction_details: {
        order_id: order_id,
        gross_amount: amount,
      },
      item_details: [
        {
          id: event._id,
          price: Math.round(event.price),
          quantity: quantity,
          name: event.title,
        },
      ],
      customer_details: {
        user_id: req.user._id,
        email: req.user.email,
      },
      // "callback_url": process.env.CALLBACK_MIDTRANS
    };

    const midtransResponse = await snap.createTransaction(transactionParams);

    res.status(200).json(
      apiResponse(true, "Berhasil mendapatkan token pembayaran", {
        paymentToken: midtransResponse.token,
        redirectUrl: midtransResponse.redirect_url,
      })
    );
  } catch (error) {
    res.status(500).json(apiResponse(false, "Terjadi kesalahan", error));
  }
};

export const midtransNotification = async (req: Request, res: Response) => {
  const notification = req.body;
  console.log(`notif: ${notification}`)

  try {
    const transactionStatus = notification.status_code;
    const orderId = notification.order_id;

    const payment = await Payment.findOne({ order_id: orderId }).populate("event");

    const event = await Event.findOne({ _id: payment?.event._id })
    if (!event) {
      return res
        .status(404)
        .json(apiResponse(false, "Event tidak ditemukan", null, 404));
    }

    if (!payment) {
      return res
        .status(404)
        .json(apiResponse(false, "Pembayaran tidak ditemukan", null, 404));
    }

    // Perbarui status pembayaran berdasarkan status transaksi dari Midtrans
    if (transactionStatus == 200) {

      if (event.quota >= payment.quantity  ) {
        event.quota -= payment.quantity;
        await Event.findByIdAndUpdate(payment?.event._id, { quota: event.quota }, { new: true });
      } else {
        return res
          .status(400)
          .json(apiResponse(false, "Kuota tiket tidak mencukupi", null, 400));
      }

      payment.paymentStatus = "paid";

      // Generate tiket sesuai jumlah yang dibeli
      const tickets = [];
      for (let i = 0; i < payment.quantity; i++) {
        const ticketCode = await generateUniqueTicketCode(); // Memanggil fungsi untuk membuat kode unik
        const qrcode = await QRCode.toDataURL(ticketCode); // Membuat QR code
        const ticketName = `Ticket ${i + 1}`;

        const ticket = new Ticket({
          name: ticketName,
          code: ticketCode,
          qrcode: qrcode,
          payment: payment._id,
          status: "AVAILABLE",
        });
        await ticket.save();
        tickets.push(ticket);
      }

      await payment.save();
      res
        .status(200)
        .json(
          apiResponse(
            true,
            "Status pembayaran berhasil diperbarui dan tiket dibuat",
            { payment, tickets }, 200));
    } else if (transactionStatus == 201) {
      payment.paymentStatus = "pending";
      await payment.save();
      res
        .status(200)
        .json(
          apiResponse(true, "Status pembayaran berhasil diperbarui", payment)
        );
    } else {
      return res.status(400).json(apiResponse(false, "Pembayaran gagal", null, 400));
    }
  } catch (error) {
    res
      .status(500)
      .json(
        apiResponse(false, "Terjadi kesalahan saat memproses notifikasi", error, 500)
      );
  }
};

export const deleteAllPayments = async (req: Request, res: Response) => {
  try {
    // Menghapus semua tiket
    const result = await Payment.deleteMany();

    // Mengecek jika ada tiket yang terhapus
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json(apiResponse(false, "No payments found to delete", 404));
    }

    res
      .status(200)
      .json(apiResponse(true, "All payments successfully deleted"));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Error deleting payments", error));
  }
};

export const getUserTransactionHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user._id;

    const transactions = await Payment.find({ user: userId })
      .populate({
        path: "event",
        select: "title date address",
      })
      .sort({ createdAt: -1 });

    if (!transactions.length) {
      return res
        .status(404)
        .json(apiResponse(false, "Tidak ada transaksi ditemukan"));
    }

    res
      .status(200)
      .json(
        apiResponse(
          true,
          "Berhasil mendapatkan histori transaksi",
          transactions
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan histori transaksi", error));
  }
};
