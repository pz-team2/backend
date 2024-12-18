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
jest.mock("bcryptjs", () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));
jest.mock("crypto", () => ({ randomBytes: jest.fn() }));
jest.mock("../../utils/apiResource", () => jest.fn());
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockImplementation((_, callback) => callback(null, {})),
  }),
}));

describe("AuthController Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    req = { body: {}, params: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    next = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  describe("Register", () => {
    // it("should register a new user and send verification email", async () => {
    //   req.body = {
    //     username: "testUser",
    //     email: "test@example.com",
    //     password: "password123",
    //   };

    //   (User.findOne as jest.Mock).mockResolvedValue(null);
    //   (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    //   (crypto.randomBytes as jest.Mock).mockReturnValue(
    //     Buffer.from("emailToken123")
    //   );

    //   const saveMock = jest.fn().mockResolvedValue(true);
    //   (User as any).mockImplementation(() => ({
    //     save: saveMock,
    //   }));

    //   await Register(req as Request, res as Response, next as NextFunction);

    //   expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    //   expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    //   expect(saveMock).toHaveBeenCalled();
    //   expect(res.json).toHaveBeenCalledWith(
    //     apiResponse(
    //       true,
    //       "Registrasi Berhasil Silahkan Verifikasi Email !!",
    //       null,
    //       201
    //     )
    //   );
    // });

    it("should return 400 if email is already registered", async () => {
      req.body = { email: "test@example.com" };
      (User.findOne as jest.Mock).mockResolvedValue({});

      await Register(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(false, "Email Sudah Terdaftar Silahkan Login !", null, 400)
      );
    });

    it("should return 500 on unexpected error", async () => {
      req.body = { email: "test@example.com" };
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Error"));

      await Register(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Terjadi Kesalahan Saat Registrasi",
          expect.any(Error),
          500
        )
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

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil Login ",
          { token: "mockToken", username: "testUser" },
          200
        )
      );
    });

    it("should return 404 if email is not found", async () => {
      req.body = { email: "notfound@example.com", password: "password123" };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await Login(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(false, "Email Tidak  Ditemukan", null, 404)
      );
    });

    it("should return 400 if password is incorrect", async () => {
      req.body = { email: "test@example.com", password: "wrongPassword" };
      const mockUser = { password: "hashedPassword" };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await Login(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(false, "Password Salah ", null, 400)
      );
    });

    it("should return 500 on unexpected error", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Error"));

      await Login(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(false, "Terjadi Kesalahan Saat Login", null, 500)
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
      expect(res.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Success Verifikasi Email Silahkan Login !!!  ",
          { users: mockUser },
          202
        )
      );
    });

    it("should return 404 if token is invalid", async () => {
      req.params = { token: "invalidToken" };
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await verifyEmail(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(false, "Token Expired ", null, 404)
      );
    });

    it("should return 500 on unexpected error", async () => {
      req.params = { token: "emailToken123" };
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Error"));

      await verifyEmail(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Terjadi Kesalahan Saat Verifikasi Email ",
          expect.any(Error),
          500
        )
      );
    });
  });
});
