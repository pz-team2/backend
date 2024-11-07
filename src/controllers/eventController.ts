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

