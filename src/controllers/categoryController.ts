import { Request, Response } from "express";
import Category, { ICategory } from "../models/Category";

// CREATE: Menambahkan kategori baru
export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    return res.status(201).json(newCategory);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error creating category", error: error });
  }
};

// READ: Mengambil semua kategori
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories: ICategory[] = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching categories", error: error });
  }
};

// READ: Mengambil kategori berdasarkan ID
export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching category", error: error });
  }
};

// UPDATE: Memperbarui kategori berdasarkan ID
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true } // Mengembalikan kategori yang telah diperbarui
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating category", error: error });
  }
};

// DELETE: Menghapus kategori berdasarkan ID
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting category", error: error });
  }
};
