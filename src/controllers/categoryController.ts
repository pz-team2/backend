import { Request, Response } from "express";
import Category from "../models/Category";
import apiResponse from "../utils/apiResource";

// Mendapatkan seluruh kategori
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res
      .json(apiResponse(true, "Berhasil mendapatkan kategori", categories, 200));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal mendapatkan kategori", error, 500));
  }
};

// Mendapatkan kategori berdasarkan ID
export const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .json(apiResponse(false, "Kategori tidak ditemukan", null, 404));
    }
    res
      .json(apiResponse(true, "Berhasil mendapatkan kategori", category, 200));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal mendapatkan kategori", error, 500));
  }
};

// Menambahkan kategori baru
export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res
      .json(apiResponse(true, "Kategori berhasil ditambahkan", newCategory, 201));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal menambahkan kategori", error, 500));
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
        .json(apiResponse(false, "Kategori tidak ditemukan", null, 404));
    }
    res
      .json(apiResponse(true, "Kategori berhasil diperbarui", updatedCategory, 200));
  } catch (error) {
    res
      .json(apiResponse(false, "Gagal memperbarui kategori", error, 500));
  }
};

// Menghapus kategori
export const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = req.params.id;
  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res
        .json(apiResponse(false, "Kategori tidak ditemukan",null, 404));
    }
    res.json(apiResponse(true, "Kategori berhasil dihapus",null, 200));
  } catch (error) {
    res.json(apiResponse(false, "Gagal menghapus kategori", error, 500));
  }
};
