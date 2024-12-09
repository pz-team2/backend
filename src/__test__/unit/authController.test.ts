import { Request, Response, NextFunction } from "express";
import { Register, Login, verifyEmail } from "../../controllers/authController";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import apiResponse from "../../utils/apiResource";
import crypto from "crypto";

// Mock dependencies
jest.mock("../../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue("Email Sent"),
  }),
}));

jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  randomBytes: jest.fn(),
}));

jest.mock("../../utils/apiResource", () => {
  return jest.fn();
});

describe("AuthController Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Reset semua mock
    jest.resetAllMocks();

    // Setup ulang mock yang diperlukan
    req = { body: {}, params: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    next = jest.fn();
    res = { status: statusMock, json: jsonMock };

    // Reset mock spesifik
    (User.findOne as jest.Mock).mockClear();
    (User.create as jest.Mock).mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
    (crypto.randomBytes as jest.Mock).mockClear();
    (apiResponse as jest.Mock).mockClear();
  });

  describe("Register", () => {
    // it("should register a new user and send verification email", async () => {
    //   req.body = {
    //     username: "testUser2",
    //     email: "test2@example.com",
    //     password: "password123",
    //   };

    //   console.log("Request body:", req.body);
    //   console.log("Mocked dependencies:", {
    //     findOne: (User.findOne as jest.Mock).mockReturnValue,
    //     create: (User.create as jest.Mock).mockReturnValue,
    //     hash: (bcrypt.hash as jest.Mock).mockReturnValue,
    //   });

    //   (User.findOne as jest.Mock).mockResolvedValue(null);

    //   (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    //   (crypto.randomBytes as jest.Mock).mockReturnValue(
    //     Buffer.from("testtoken")
    //   );

    //   const createMock = User.create as jest.Mock;
    //   createMock.mockImplementation(async (data) => {
    //     console.log("User.create called with:", data);
    //     return {
    //       _id: "userId123",
    //       username: data.username,
    //       email: data.email,
    //       emailToken: data.emailToken,
    //       isVerified: false,
    //       save: jest.fn().mockResolvedValue(true),
    //     };
    //   });

    //   const mockSendMail = jest.fn((_, callback) => {
    //     callback(null, { messageId: "test" });
    //   });
    //   (nodemailer.createTransport as jest.Mock).mockReturnValue({
    //     sendMail: mockSendMail,
    //   });

    //   (apiResponse as jest.Mock).mockReturnValue({
    //     success: true,
    //     message: "Registrasi Berhasil Silahkan Verifikasi Email !!",
    //   });

    //   await Register(req as Request, res as Response, next as NextFunction);

    //   console.log("User.create mock calls:", createMock.mock.calls);
    //   console.log(
    //     "bcrypt.hash mock calls:",
    //     (bcrypt.hash as jest.Mock).mock.calls
    //   );
    //   console.log(
    //     "crypto.randomBytes mock calls:",
    //     (crypto.randomBytes as jest.Mock).mock.calls
    //   );

    //   expect(User.findOne).toHaveBeenCalledWith({ email: "test2@example.com" });
    //   expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

    //   expect(createMock).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       username: "testUser2",
    //       email: "test2@example.com",
    //       emailToken: expect.any(String),
    //       isVerified: false,
    //     })
    //   );

    //   expect(statusMock).toHaveBeenCalledWith(201);
    //   expect(apiResponse).toHaveBeenCalledWith(
    //     true,
    //     "Registrasi Berhasil Silahkan Verifikasi Email !!"
    //   );
    // });

    it("should return 400 if email is already registered", async () => {
      req.body = { email: "test@example.com" };
      (User.findOne as jest.Mock).mockResolvedValue({}); // Simulate existing user

      await Register(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Email Sudah Terdaftar Silahkan Login !")
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.body = { email: "test@example.com" };
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await Register(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Terjadi Kesalahan Saat Registrasi ")
      );
    });
  });

  describe("Login", () => {
    it("should return token for valid credentials", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      const mockUser = {
        id: "userId123",
        username: "testUser",
        password: "hashedPassword",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      await Login(req as Request, res as Response, next as NextFunction);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "userId123" },
        expect.any(String),
        { expiresIn: "24h" }
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Login ", {
          token: "mockToken",
          username: "testUser",
        })
      );
    });

    it("should return 400 if email is not found", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      // Mock bahwa user tidak ditemukan
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock API Response dengan objek yang sesuai
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Email Tidak Ditemukan", // Pastikan tidak ada spasi tambahan
      });

      // Jalankan fungsi Login
      await Login(req as Request, res as Response, next as NextFunction);

      // Assertions
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(apiResponse).toHaveBeenCalledWith(false, "Email Tidak  Ditemukan");
    });

    it("should return 400 if password is incorrect", async () => {
      req.body = { email: "test@example.com", password: "wrongPassword" };

      const mockUser = { password: "hashedPassword" };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await Login(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Password Salah ")
      );
    });

    it("should return 500 if an error occurs during login", async () => {
      req.body = { email: "test@example.com", password: "password123" };

      // Mock error pada proses login
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Mock API Response
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Terjadi Kesalahan Saat Login",
      });

      // Jalankan fungsi Login
      await Login(req as Request, res as Response, next as NextFunction);

      // Assertions
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Terjadi Kesalahan Saat Login")
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      req.params = { token: "emailToken123" };

      const mockUser = {
        emailToken: "emailToken123",
        isVerified: false,
        save: jest.fn(),
      };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await verifyEmail(req as Request, res as Response, next as NextFunction);

      expect(User.findOne).toHaveBeenCalledWith({
        emailToken: "emailToken123",
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Success Verifikasi Email Silahkan Login !!!  ", {
          users: mockUser,
        })
      );
    });

    it("should return 400 if token is invalid", async () => {
      req.params = { token: "invalidToken" };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await verifyEmail(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Token Expired ")
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { token: "emailToken123" };
      (User.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await verifyEmail(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Terjadi Kesalahan Saat Verifikasi Email ",
          expect.any(Error)
        )
      );
    });
  });
});
