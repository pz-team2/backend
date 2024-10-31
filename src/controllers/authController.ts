import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

// Controller Register
export const Register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Simpan user ke database
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

// Controller Login
export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    // Cek password
    const checkpassword = await bcrypt.compare(password, user.password);
    if (!checkpassword) {
      return res.status(400).json({ message: "Password Salah" });
    }

    // Buat payload dan token JWT
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        username: user.username,
        id: user.id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in user", error });
  }
};
