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
            return res.status(400).json(apiResponse(false, 'Email Tidak  Ditemukan'));
        }

        const checkpassword = await bcrypt.compare(password, organizer.password);
        if (!checkpassword) {
            return res.status(400).json(apiResponse(false, 'Password Salah '));
        }

        const {role} = organizer
        // Buat payload dan token JWT
        const payload = { organizerId: organizer.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

        return res.status(200).json(apiResponse(true, 'Berhasil Login ', { token, role }));
    } catch (error) {
        return res.status(500).json(apiResponse(false, 'Terjadi Kesalahan Saat Login'));
    }
}