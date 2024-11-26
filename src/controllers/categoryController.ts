import { Request, Response } from "express";
import Category from "../models/Category";
import apiResponse from "../utils/apiResource";

// Mendapatkan seluruh kategori
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan kategori", categories));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan kategori", error));
  }
};

// Mendapatkan kategori berdasarkan ID
export const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json(apiResponse(false, "Kategori tidak ditemukan"));
    }
    res
      .status(200)
      .json(apiResponse(true, "Berhasil mendapatkan kategori", category));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal mendapatkan kategori", error));
  }
};

// Menambahkan kategori baru
export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res
      .status(201)
      .json(apiResponse(true, "Kategori berhasil ditambahkan", newCategory));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal menambahkan kategori", error));
  }
};

// Mengupdate kategori
export const updateCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  const { name, description } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json(apiResponse(false, "Kategori tidak ditemukan"));
    }
    res
      .status(200)
      .json(apiResponse(true, "Kategori berhasil diperbarui", updatedCategory));
  } catch (error) {
    res
      .status(500)
      .json(apiResponse(false, "Gagal memperbarui kategori", error));
  }
};

// Menghapus kategori
export const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res
        .status(404)
        .json(apiResponse(false, "Kategori tidak ditemukan"));
    }
    res.status(200).json(apiResponse(true, "Kategori berhasil dihapus"));
  } catch (error) {
    res.status(500).json(apiResponse(false, "Gagal menghapus kategori", error));
  }
};
