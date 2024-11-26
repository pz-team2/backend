import { Request, Response } from "express";
import Category from "../models/Category";
import apiResponse from "../utils/apiResource";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         username:
 *           type: string
 *           description: Unique username of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's hashed password
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Gender of the user
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the user
 *         city:
 *           type: string
 *           description: City of residence
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the user's email is verified
 *         emailToken:
 *           type: string
 *           description: Email verification token
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Mendapatkan seluruh kategori
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Mendapatkan semua kategori
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan kategori.
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Gagal mendapatkan kategori.
 */
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
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Mendapatkan kategori berdasarkan ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan kategori.
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
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Kategori tidak ditemukan.
 *       500:
 *         description: Gagal mendapatkan kategori.
 */
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
/**
 * @swagger
 * /api/categories/add:
 *   post:
 *     summary: Menambahkan kategori baru
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kategori berhasil ditambahkan.
 *       500:
 *         description: Gagal menambahkan kategori.
 */
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
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Memperbarui kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui.
 *       404:
 *         description: Kategori tidak ditemukan.
 *       500:
 *         description: Gagal memperbarui kategori.
 */
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
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Menghapus kategori
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil dihapus.
 *       404:
 *         description: Kategori tidak ditemukan.
 *       500:
 *         description: Gagal menghapus kategori.
 */
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
