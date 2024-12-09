import { Response, Request, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import { google } from "googleapis";
import apiResponse from "../utils/apiResource";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const getAccessToken = async (): Promise<string> => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Gagal !! access token");
    // console.log("Access Token: ", token);
    return token;
  } catch (error) {
    // console.log("Error access token:", error);
    throw new Error("Tidak Bisa Mendapatkan Acces Token");
  }
};

export const Register: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      res
        .status(400)
        .json(apiResponse(false, "Email Sudah Terdaftar Silahkan Login !"));
      return;
    }

    const hashpw = await bcrypt.hash(password, 10);
    const emailToken = crypto.randomBytes(64).toString("hex");

    const user = new User({
      username,
      email,
      password: hashpw,
      emailToken,
      isVerified: false,
    });

    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify/${emailToken}`;
    const accessToken = await getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verifikasi Email Anda",
      html: `
        <h1>Hello, Dear ${username},</h1>
        <p>Kamu telah berhasil membuat akun GoEvent Nih</p>
        <p>Untuk menyelesaikan verifikasi Akun Kamu, silakan Klik Tombol Di Bawah Ini Ya</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Verifikasi Akun
          </a>
        </p>
        <p>Jika Anda memiliki pertanyaan atau membutuhkan informasi lebih lanjut, silakan hubungi kami di <a href="goevent883@gmail.com">admin goevent</a>.</p>
        <p>Happy Nice Dream</p>
        <p>Salam hangat,<br>Management goevent</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log("Error sending email: ", error);
        res.status(500).json(apiResponse(false, "Email Gagal Terkirim", error));
      } else {
        res
          .status(201)
          .json(
            apiResponse(
              true,
              "Registrasi Berhasil Silahkan Verifikasi Email !!"
            )
          );
      }
    });
  } catch (error) {
    // console.log("Terjadi Kesalahan Saat Registrasi ", error);
    res
      .status(500)
      .json(apiResponse(false, "Terjadi Kesalahan Saat Registrasi "));
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
