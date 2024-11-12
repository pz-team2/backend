import { Request, Response } from "express";
import Organizer from "../models/Organizer";
import apiResponse from "../utils/apiResource";
import bcrypt from 'bcryptjs'

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

  const { username, phoneNumber, organizerName, email, password } = req.body;
  try {

    const hashpassword = await bcrypt.hash(password, 10);

    const newOrganizer = new Organizer({ username, phoneNumber, organizerName, email, password: hashpassword });
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
  const { username, phoneNumber, organizerName, email } = req.body;
  try {
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { username, phoneNumber, organizerName, email },
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

export const dataterbaru = async (req: Request, res: Response) => {

  const OrganizerId = req.organizer.id
  console.log(OrganizerId)
  res.status(200).json(apiResponse(true, 'data', OrganizerId));

}


export const getTerbaru = async (req: Request, res: Response) => {

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
}
