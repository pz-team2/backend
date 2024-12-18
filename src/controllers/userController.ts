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
      .json(apiResponse(true, "Berhasil Mendapatkan Data User", users, 200));
  } catch (error) {
    res.json(apiResponse(false, "Data Tidak Tersedia", error, 500));
  }
};

// Controller untuk mendapatkan data user berdasarkan id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json(apiResponse(false, "User Tidak Di Temukan", 404));
    }

    return res
      .json(apiResponse(true, "Berhasil Mengambil Detail User", { user }, 200));
  } catch (error) {
    return res
      .json(apiResponse(false, "Gagal Mengambil Data", error, 500));
  }
};

// Update Data
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.user.id; // Ambil id user dari parameter URL
  const { username, email, fullName, gender, phoneNumber, city } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json(apiResponse(false, "User Tidak Di Temukan",null, 404));
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (city) user.city = city;

    await user.save();

    return res.json(apiResponse(true, "successfully", user, 200));
  } catch (error) {
    return res.json(apiResponse(false, "Erorr Update User", error, 500));
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
      return res.json(apiResponse(false, "User Tidak Di Temukan",null, 404));
    }

    const pw = await bcrypt.compare(password, datapassword.password);
    if (!pw) {
      return res
        .json(apiResponse(false, "Paasword Yang Masukan Saat Ini Salah",null, 404));
    }

    if (pwbaru !== confirmpw) {
      res
        
        .json(apiResponse(false, "Password Tidak Sama Ulangi !!!",null, 505));
    }

    const hashPw = await bcrypt.hash(pwbaru, 10);
    datapassword.password = hashPw;
    await datapassword.save();
    res.json(apiResponse(true, "Berhasil Update Password",null, 200, ));
  } catch (error) {
    // console.log(error);
    res.json(apiResponse(false, "Gagal Update Password", error, 505));
  }
};
