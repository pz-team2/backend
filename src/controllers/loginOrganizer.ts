import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

export const LoginOrganizer = async (req: Request, res: Response) => {
    const { email, password } = req.body;


    try {

        const organizer = await Organizer.findOne({ email });

        if (!organizer) {
            return res.json(apiResponse(false, 'Email Tidak  Ditemukan', null, 400));
        }

        const checkpassword = await bcrypt.compare(password, organizer.password);
        if (!checkpassword) {
            return res.json(apiResponse(false, 'Password Salah ', 400));
        }

        const {role} = organizer
        // Buat payload dan token JWT
        const payload = { organizerId: organizer.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

        return res.json(apiResponse(true, 'Berhasil Login ', { token, role }, 200));
    } catch (error) {
        return res.json(apiResponse(false, 'Terjadi Kesalahan Saat Login', null, 500));
    }
}