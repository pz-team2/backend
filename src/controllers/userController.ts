// userController.ts
import { Response, Request } from "express";
import User from "../models/User";
import dotenv from "dotenv";
import apiResponse from "../utils/apiResource";
import bcrypt from "bcryptjs";

dotenv.config();

// Controller untuk mendapatkan seluruh data user
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Failed to retrieve users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json(apiResponse(true, "Berhasil Mendapatkan Data User", { users }));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Data Tidak Tersedia", error));
  }
};

// Controller untuk mendapatkan data user berdasarkan id
/**
 * @swagger
 * /api/users/detail/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user data
 */
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
/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               fullName:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phoneNumber:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user data
 */
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
/**
 * @swagger
 * /api/users/updatePassword:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               pwbaru:
 *                 type: string
 *               confirmpw:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: User not found
 *       505:
 *         description: Failed to update password
 */
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { password, pwbaru, confirmpw } = req.body;
    const userId = req.user.id;
    console.log(userId);

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
    console.log(error);
    res.status(505).json(apiResponse(false, "Gagal Update Password", error));
  }
};
