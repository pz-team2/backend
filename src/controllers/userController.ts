// userController.ts
import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

// Controller untuk mendapatkan seluruh data user
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users: IUser[] = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Controller untuk mendapatkan data user berdasarkan id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id; // Ambil id user dari parameter URL

  try {
    // Cari user berdasarkan ID
    const user = await User.findById(userId);
    // const user = await User.findById(userId).select("-password"); // Menghindari mengembalikan password

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user", error });
  }
};

// Controller untuk memperbarui data user berdasarkan id
export const updateUserById = async (req: Request, res: Response) => {
  const userId = req.params.id; // Ambil id user dari parameter URL
  const { username, email, password, fullName, gender, phoneNumber, city } =
    req.body;

  try {
    // Cari user berdasarkan ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Update data user
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (city) user.city = city;
    if (password) user.password = await bcrypt.hash(password, 10); // Hash password jika diubah

    // Simpan perubahan ke database
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile", error });
  }
};
