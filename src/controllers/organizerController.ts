import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";

// Mendapatkan semua organizer
export const getOrganizers = async (req: Request, res: Response) => {
  try {
    const organizers = await Organizer.find();
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan organizer", organizers));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan organizer", error));
  }
};

// Mendapatkan organizer berdasarkan ID
export const getOrganizerById = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  try {
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan organizer", organizer));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan organizer", error));
  }
};

// Menambahkan organizer baru
export const createOrganizer = async (req: Request, res: Response) => {
  const { name, description, contact } = req.body;
  try {
    const newOrganizer = new Organizer({ name, description, contact });
    await newOrganizer.save();
    res
      .status(201)
      .json(apiResponse(true, "Organizer berhasil ditambahkan", newOrganizer));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menambahkan organizer", error));
  }
};

// Mengupdate data organizer
export const updateOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  const { name, description, contact } = req.body;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { name, description, contact },
      { new: true }
    );
    if (!updatedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res
      .status(200)
      .json(
        apiResponse(true, "Organizer berhasil diperbarui", updatedOrganizer)
      );
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui organizer", error));
  }
};

// Menghapus organizer
export const deleteOrganizer = async (req: Request, res: Response) => {
  const organizerId = req.params.id;
  try {
    const deletedOrganizer = await Organizer.findByIdAndDelete(organizerId);
    if (!deletedOrganizer) {
      return res
        .status(404)
        .json(apiResponse(false, "Organizer tidak ditemukan"));
    }
    res.status(200).json(apiResponse(true, "Organizer berhasil dihapus"));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menghapus organizer", error));
  }
};