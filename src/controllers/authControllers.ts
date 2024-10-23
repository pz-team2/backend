import { Response, Request } from "express";
import bcrypt from 'bcryptjs';
import { User } from "../models/User";
import Jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';

export const Register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        let Users = await User.findOne({ email });

        if (Users) {
            return res.status(400).json({ message: "Email Sudah Terdaftar" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        // Simpan user ke database
        await user.save();

        return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error registering user", error });
    }
};


export const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });


        if (!user) {

            return res.status(400).json({ message: "Email Tidak Di temukan" })
        }

        const checkpassword = await bcrypt.compare(password, user.password);
        if (!checkpassword) {
            return res.status(400).json({ message: "Password Salah" })
        }


        const nilai = { userId: user.id }
        const token = Jwt.sign(nilai, JWT_SECRET, { expiresIn: '1m' })

        return res.status(200).json({
            messege: 'Login successful',
            token,
            user: {
                email: user.email,
                username: user.username,
                id: user.id

            }
        });

    } catch (error) {
        return res.status(500).json({ message: "Error login user", error })

    }
}