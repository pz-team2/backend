// userController.ts
import { Response, Request } from "express";
import User from "../models/User";
import dotenv from "dotenv";
import apiResponse from "../utils/apiResource";

dotenv.config();

// Controller untuk mendapatkan seluruh data user
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
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
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving user data
 */
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

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
 * /api/users/{id}/update:
 *   put:
 *     summary: Update a user's information
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user data
 */
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id; // Ambil id user dari parameter URL
  const { username, email, fullName, gender, phoneNumber, city } = req.body;

  try {
    // Cari user berdasarkan ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(apiResponse(false, "User Tidak Di Temukan"));
    }

    // Update data user
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (gender) user.gender = gender;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (city) user.city = city;

    // Simpan perubahan ke database
    await user.save();

    return res.status(200).json(apiResponse(false, "successfully", { user }));
  } catch (error) {
    return res.status(500).json(apiResponse(false, "Erorr Update User", error));
  }
};
