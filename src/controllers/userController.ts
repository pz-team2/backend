// userController.ts
import { Response, Request } from "express";
import User from "../models/User";
import dotenv from "dotenv";
import apiResponse from "../utils/apiResource";
import bcrypt from "bcryptjs";

dotenv.config();

// Controller untuk mendapatkan seluruh data user
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json(apiResponse(true, "Berhasil Mendapatkan Data User", users));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Data Tidak Tersedia", error));
  }
};

// Controller untuk mendapatkan data user berdasarkan id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(apiResponse(false, "User Tidak Di Temukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, "Berhasil Mengambil Detail User", { user }));
  } catch (error) {
    return res
      .status(500)
      .json(apiResponse(false, "Gagal Mengambil Data", error));
  }
};

// Update Data
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.user.id; // Ambil id user dari parameter URL
  const { username, email, fullName, gender, phoneNumber, city } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(apiResponse(false, "User Tidak Di Temukan"));
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (city) user.city = city;

    await user.save();

    return res.status(200).json(apiResponse(true, "successfully", user));
  } catch (error) {
    return res.status(500).json(apiResponse(false, "Erorr Update User", error));
  }
};

// Update Password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { password, pwbaru, confirmpw } = req.body;
    const userId = req.user.id;
    // console.log(userId);

    const datapassword = await User.findById(userId);

    if (!datapassword) {
      return res.status(404).json(apiResponse(false, "User Tidak Di Temukan"));
    }

    const pw = await bcrypt.compare(password, datapassword.password);
    if (!pw) {
      return res
        .status(404)
        .json(apiResponse(false, "Paasword Yang Masukan Saat Ini Salah"));
    }

    if (pwbaru !== confirmpw) {
      res
        .status(505)
        .json(apiResponse(false, "Password Tidak Sama Ulangi !!!"));
    }

    const hashPw = await bcrypt.hash(pwbaru, 10);
    datapassword.password = hashPw;
    await datapassword.save();
    res.status(200).json(apiResponse(true, "Berhasil Update Password"));
  } catch (error) {
    // console.log(error);
    res.status(505).json(apiResponse(false, "Gagal Update Password", error));
  }
};
