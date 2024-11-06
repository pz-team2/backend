import { Request, Response } from "express";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";

export const tambahEvent = async (req: Request, res: Response) => {
    try {
        console.log('File yang diterima:', req.file); // Untuk memeriksa file yang diterima
        console.log('Body yang diterima:', req.body); // Untuk memeriksa data form lainnya

        if (!req.file) {
            return res.status(400).json({ message: 'File gambar diperlukan!' });
        }

        // Ambil data dari body form dan file
        const { title, quota, price, startTime, finishTime, date, address, status, description, organizer, category } = req.body;
        const picture = req.file.path; // Lokasi file yang di-upload

        const newEvent = new Event({
            title,
            quota,
            price,
            startTime,
            finishTime,
            picture, // File gambar
            date,
            address,
            status,
            description,
            category,
            organizer
        });

        await newEvent.save();
        res.status(200).json({
            success: true,
            message: 'Berhasil Menambahkan Data',
            event: newEvent
        });
    } catch (error) {
        console.error('Error saat menambahkan event:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan data',
            error: error
        });
    }
};

