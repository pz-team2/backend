import { Request, Response, NextFunction } from "express";
import { Register, Login, verifyEmail } from "../../controllers/authController";
import User from "../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import apiResponse from "../../utils/apiResource";

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

describe("AuthController Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = { body: {}, params: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    next = jest.fn();
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  describe("Register", () => {
    // it("should register a new user and send verification email", async () => {
    //   req.body = {
    //     username: "testUser2",
    //     email: "test2@example.com",
    //     password: "password123",
    //   };

    //   const mockUserSave = jest.fn();
    //   (User.findOne as jest.Mock).mockResolvedValue(null); // Simulate no user found
    //   (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    //   (User as unknown as jest.Mock).mockImplementation(() => ({
    //     save: mockUserSave,
    //   }));

    //   const mockTransporter = {
    //     sendMail: jest.fn((options, callback) => callback(null, "Email Sent")),
    //   };
    //   (nodemailer.createTransport as jest.Mock).mockReturnValue(
    //     mockTransporter
    //   );

    //   await Register(req as Request, res as Response, next as NextFunction);

    //   expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    //   expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    //   expect(mockUserSave).toHaveBeenCalled();
    //   expect(mockTransporter.sendMail).toHaveBeenCalled();
    //   expect(statusMock).toHaveBeenCalledWith(201);
    //   expect(jsonMock).toHaveBeenCalledWith(
    //     apiResponse(true, "Registrasi Berhasil Silahkan Verifikasi Email !!")
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

    // it("should return 400 if email is not found", async () => {
    //   req.body = { email: "test@example.com", password: "password123" };
    //   (User.findOne as jest.Mock).mockResolvedValue(null);

    //   await Login(req as Request, res as Response, next as NextFunction);

    //   expect(statusMock).toHaveBeenCalledWith(400);
    //   expect(jsonMock).toHaveBeenCalledWith(
    //     apiResponse(false, "Email Tidak Ditemukan")
    //   );
    // });

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

    // it("should return 500 if an error occurs", async () => {
    //   req.body = { email: "test@example.com", password: "password123" };
    //   (User.findOne as jest.Mock).mockRejectedValue(
    //     new Error("Database error")
    //   );

    //   await Login(req as Request, res as Response, next as NextFunction);

    //   expect(statusMock).toHaveBeenCalledWith(500);
    //   expect(jsonMock).toHaveBeenCalledWith(
    //     apiResponse(false, "Terjadi Kesalahan Saat Login")
    //   );
    // });
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
