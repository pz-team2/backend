import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

export const LoginOrganizer = async (req: Request, res: Response) => {
    const { email, password } = req.body;


    try {

        const user = await Organizer.findOne({ email });

        if (!user) {
            return res.status(400).json(apiResponse(false, 'Email Tidak  Ditemukan'));
        }

        const checkpassword = await bcrypt.compare(password, user.password);
        if (!checkpassword) {
            return res.status(400).json(apiResponse(false, 'Password Salah '));
        }

        // Buat payload dan token JWT
        const payload = { userId: user.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json(apiResponse(true, 'Berhasil Login ', { token }));
    } catch (error) {
        return res.status(500).json(apiResponse(false, 'Terjadi Kesalahan Saat Login'));
    }
}