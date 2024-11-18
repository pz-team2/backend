import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";
import Payment from "../models/Payment";

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


export const getDataUser = async (req: Request, res: Response) => {
  try {
    // Ambil query parameters
    const {
      status,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 6,
      category,
    } = req.query;

    // Parse 'page' dan 'limit' ke tipe yang tepat
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // Build query untuk filtering
    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (category) {
      query.category = category;
    }

    // Hitung total data untuk pagination
    const total = await User.countDocuments(query);

    // Pagination: Hitung skip dan limit
    const skip = (pageNumber - 1) * limitNumber;

    // Tentukan urutan (sort) berdasarkan parameter
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, 1 | -1> = {
      [sortBy as string]: sortDirection,
    };

    // Agregasi untuk mendapatkan data pengguna
    const users = await User.aggregate([
      // Gabungkan data kategori
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      // Gabungkan data organizer
      {
        $lookup: {
          from: 'organizers',
          localField: 'organizer',
          foreignField: '_id',
          as: 'organizerDetails',
        },
      },
      // Gabungkan data pembayaran
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'user',
          as: 'paymentDetails',
        },
      },
      // Hitung total tiket yang dibeli oleh pengguna
      {
        $addFields: {
          totalTickets: {
            $sum: { $map: { input: '$paymentDetails', as: 'payment', in: '$$payment.quantity' } },
          },
        },
      },
      // Filter berdasarkan query (kategori, status, tanggal, dll.)
      { $match: query },

      // Tentukan urutan berdasarkan parameter
      { $sort: sortOptions },

      // Proses pagination (skip dan limit)
      { $skip: skip },
      { $limit: limitNumber },

      // Pilih field yang akan ditampilkan
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          category: { $arrayElemAt: ['$categoryDetails.name', 0] },
          organizer: { $arrayElemAt: ['$organizerDetails.organizerName', 0] },
          totalTickets: 1,
        },
      },
    ]);

    // Hitung jumlah halaman terakhir
    const lastPage = Math.ceil(total / limitNumber);

    // Respons data dengan pagination
    const response = {
      data: users,
      pagination: {
        total,
        page: pageNumber,
        lastPage,
        hasNextPage: pageNumber < lastPage,
        hasPrevPage: pageNumber > 1,
      },
    };

    // Jika tidak ada pengguna ditemukan
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data Tidak Tersedia',
        data: { message: 'No users found' },
      });
    }

    // Jika berhasil
    res.status(200).json({
      success: true,
      message: 'Berhasil Mendapatkan Data User',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({
      success: false,
      message: 'Data Tidak Tersedia',
      data: { message: error },
    });
  }
};





