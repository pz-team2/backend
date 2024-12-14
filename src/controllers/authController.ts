import { Response, Request, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
// import { google } from "googleapis";
import apiResponse from "../utils/apiResource";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

export const Register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      res.status(400).json(apiResponse(false, "Email Sudah Terdaftar Silahkan Login !", null, 400));
      return;
    }

    const hashpw = await bcrypt.hash(password, 10);

    const emailToken = crypto.randomBytes(64).toString("hex");
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${emailToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'goevent883@gmail.com', 
        pass: 'iypc omhh nyvz onuw',
      },
    });

    // Opsi email
    const mailOptions = {
      from: '"GoEvent" <noreply@goevent.com>',
      to: email,
      subject: "Verifikasi Email Anda",
      text: `Hello, terima kasih telah mendaftar di GoEvent. Klik link berikut untuk memverifikasi email Anda: ${verificationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://img.icons8.com/?size=100&id=cHNRcWMI2bLJ&format=png&color=000000" alt="GoEvent Logo" style="width: 120px;"/>
          </div>
          <h2 style="color: #333; text-align: center;">Verifikasi Email Anda</h2>
          <p style="color: #555;">Hello, terima kasih telah mendaftar di <strong>GoEvent</strong>. Klik link berikut untuk memverifikasi email Anda:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" 
              style="background-color: #007bff; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block;">
              Verifikasi Sekarang
            </a>
          </div>
          <p style="color: #555;">Jika Anda tidak mendaftar di GoEvent, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            &copy; 2024 GoEvent. Semua Hak Dilindungi.
          </p>
        </div>
      `,
    };

    // Mengirim email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error:", error);
        res.status(500).json(apiResponse(false, "Email Gagal Terkirim", error, 500));
      } else {
        const user = new User({
          username,
          email,
          password: hashpw,
          emailToken,
          isVerified: false,
        });

        await user.save();
        res.status(201).json(
          apiResponse(true, "Registrasi Berhasil Silahkan Verifikasi Email !!", null, 201)
        );
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(apiResponse(false, "Terjadi Kesalahan Saat Registrasi", error, 500));
  }
};



// Login
export const Login: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json(apiResponse(false, "Email Tidak  Ditemukan"));
    }

    const checkpassword = await bcrypt.compare(password, user.password);
    if (!checkpassword) {
      return res.status(400).json(apiResponse(false, "Password Salah "));
    }

    // Buat payload dan token JWT
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    return res
      .status(200)
      .json(
        apiResponse(true, "Berhasil Login ", { token, username: user.username })
      );
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, "Terjadi Kesalahan Saat Login"));
  }
};

export const verifyEmail: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;

  try {
    const users = await User.findOne({ emailToken: token });

    if (!users) {
      res.status(400).json(apiResponse(false, "Token Expired "));
      return;
    }

    users.emailToken = undefined;
    users.isVerified = true;
    await users.save();

    res.status(200).json(
      apiResponse(true, "Success Verifikasi Email Silahkan Login !!!  ", {
        users,
      })
    );
  } catch (error) {
    // console.log("Error during email verification:", error);
    res
      .status(500)
      .json(
        apiResponse(false, "Terjadi Kesalahan Saat Verifikasi Email ", error)
      );
  }
};