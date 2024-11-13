import { Request, Response } from "express";
import Event, {IEvent} from "../models/Event";
import apiResponse from "../utils/apiResource";
import Payment from "../models/Payment";
import moment from 'moment-timezone';
const sanitizeHtml = require('sanitize-html');

export const tambahEvent = async (req: Request, res: Response) => {
  try {
    const organizerId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File gambar diperlukan!' });
    }



    const { title, quota, price, startTime, finishTime, address, status, description, category } = req.body;

    const sanitizedContent = sanitizeHtml(description, {
      allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'blockquote', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
      allowedAttributes: {
        'a': [ 'href', 'target' ]
      },
    });
    
    const jam = moment(req.body.date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
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
      organizer: organizerId
    });

    // Menyimpan event baru ke database
    await newEvent.save();

    // Mengirim response sukses
    res.status(200).json(apiResponse(true, 'Berhasil Menambahkan Data',  newEvent));
  } catch (error) {
    // Menangani error dan mengirim response
    res.status(500).json(apiResponse(false, 'Gagal Menambahkan Data', error));
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
    const event = await Event.findById(req.params.id);
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
      organizer,
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
    event.organizer = organizer;
    event.category = category;
    if (picture) {
      event.picture = picture;
    }

    await event.save();
    res.status(200).json(apiResponse(true, "Event berhasil diperbarui", event));
  } catch (error) {
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
      .populate('category', 'name')
      .populate('organizer', 'organizerName email phoneNumber')
      .exec();

    const lastPage = Math.ceil(total / Number(limit));

    const response = {
      data: events,
      pagination: {
        total,
        page: Number(page),
        lastPage,
        hasNextPage: Number(page) < lastPage,
        hasPrevPage: Number(page) > 1
      }
    };

    res.status(200).json(
      apiResponse(true, "Berhasil mendapatkan event terbaru", response)
    );
  } catch (error) {
    res.status(500).json(
      apiResponse(false, "Gagal mendapatkan event terbaru", error)
    );
  }
};


// Tipe Event yang sudah di-populate
interface PopulatedEvent extends Omit<IEvent, 'organizer'> {
  organizer: {
    organizerName: string;
  };
}


export const getDataEventOrganizer = async (req: Request, res: Response) => {
  try {

    const events = await Event.find()
    .populate('organizer', 'organizerName')
    .sort({ date: -1 }) 

    const eventData = await Promise.all(events.map(async (event) => {
      const tiketTerjual = await Payment.aggregate([
        { $match: { event: event._id, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: "$quantity" } } },
      ]);

      const jam = moment(event.date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

      return {
        id: event._id,
        title: event.title,
        picture: event.picture,
        date: jam,
        status: event.status,
        organizerName: (event.organizer as any)?.organizerName || '',
        ticketsSold: tiketTerjual[0]?.total || 0,
      };
    }));

    // Mengirim respons dengan format yang disederhanakan
    res.status(200).json(apiResponse(true, "Berhasil mendapatkan event terbaru", eventData));

  } catch (error) {
    res.status(404).json(apiResponse(false, "Gagal mendapatkan event terbaru", error));
  }
};






