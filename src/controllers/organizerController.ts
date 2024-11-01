import { Request, Response } from "express";
import Organizer, { IOrganizer } from "../models/Organizer";
import bcrypt from "bcryptjs";

// CREATE: Menambahkan organizer baru
export const createOrganizer = async (req: Request, res: Response) => {
  const { username, email, password, role, organizerName, phoneNumber } =
    req.body;

  try {
    // Cek apakah username sudah digunakan
    const existingUsername = await Organizer.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await Organizer.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganizer = new Organizer({
      username,
      email,
      password: hashedPassword, // Simpan password yang telah di-hash
      role,
      organizerName,
      phoneNumber,
    });

    await newOrganizer.save();
    return res.status(201).json(newOrganizer);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error creating organizer", error: error });
  }
};

// READ: Mengambil semua organizer
export const getOrganizers = async (req: Request, res: Response) => {
  try {
    const organizers: IOrganizer[] = await Organizer.find();
    return res.status(200).json(organizers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching organizers", error: error });
  }
};

// READ: Mengambil organizer berdasarkan ID
export const getOrganizerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const organizer = await Organizer.findById(id);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }
    return res.status(200).json(organizer);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching organizer", error: error });
  }
};

// UPDATE: Memperbarui organizer berdasarkan ID
export const updateOrganizer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, password, role, organizerName, phoneNumber } =
    req.body;

  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      id,
      { username, email, password, role, organizerName, phoneNumber },
      { new: true } // Mengembalikan organizer yang telah diperbarui
    );

    if (!updatedOrganizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    return res.status(200).json(updatedOrganizer);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating organizer", error: error });
  }
};

// DELETE: Menghapus organizer berdasarkan ID
export const deleteOrganizer = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedOrganizer = await Organizer.findByIdAndDelete(id);
    if (!deletedOrganizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    return res.status(200).json({ message: "Organizer deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting organizer", error: error });
  }
};
