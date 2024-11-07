import { Request, Response } from "express";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";

export const tambahEvent = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: 'File gambar diperlukan!' });
        }

        const { title, quota, price, startTime, finishTime, date, address, status, description, organizer, category } = req.body;
        const picture = req.file.path;

        const newEvent = new Event({
            title,
            quota,
            price,
            startTime,
            finishTime,
            picture,
            date,
            address,
            status,
            description,
            category,
            organizer
        });

        await newEvent.save();
        res.status(200).json( apiResponse(true, 'Berhasil Menambahkan Data',{newEvent}));
    } catch (error) {
        res.status(500).json(apiResponse(true, 'Berhasil Menambahkan Data',error));
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

