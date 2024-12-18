import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const categoriesRouter = Router();

// Category Component Schema
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
categoriesRouter.get("/", getCategories);

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
categoriesRouter.post("/add", createCategory);

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
categoriesRouter.get("/:id", getCategoryById);

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
categoriesRouter.put("/:id", updateCategory);

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
categoriesRouter.delete("/:id", deleteCategory);

export default categoriesRouter;
