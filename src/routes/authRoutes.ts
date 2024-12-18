import { Router } from "express";
import { Register, Login, verifyEmail } from "../controllers/authController";
const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Endpoint untuk mendaftarkan user baru dengan username, email, dan password. Jika registrasi berhasil, akan mengirim email verifikasi.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username yang dipilih oleh user
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 description: Email yang akan digunakan untuk login dan verifikasi
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Password untuk keamanan akun
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User berhasil terdaftar, email verifikasi dikirim.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registrasi Berhasil Silahkan Verifikasi Email !!
 *       400:
 *         description: Email sudah terdaftar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email Sudah Terdaftar Silahkan Login !
 *       500:
 *         description: Terjadi kesalahan saat proses registrasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Terjadi Kesalahan Saat Registrasi
 */
router.post("/register", Register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Login error
 */
router.post("/login", Login);

/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify user's email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Token expired or invalid
 *       500:
 *         description: Error verifying email
 */
router.get("/verify/:token", verifyEmail);

export default router;
