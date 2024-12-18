import { Request, Response } from "express";
import { LoginOrganizer } from "../../controllers/loginOrganizer";
import Organizer from "../../models/Organizer";
import apiResponse from "../../utils/apiResource";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../../models/Organizer");
jest.mock("../../utils/apiResource");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("LoginOrganizer", () => {
  const mockRequest = (body: any) => {
    return {
      body,
    } as Request;
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.json = jest.fn().mockReturnThis();
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if email is not found", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    const res = mockResponse();

    (Organizer.findOne as jest.Mock).mockResolvedValue(null);
    (apiResponse as jest.Mock).mockReturnValue("mocked response");

    await LoginOrganizer(req, res);

    expect(apiResponse).toHaveBeenCalledWith(
      false,
      "Email Tidak  Ditemukan",
      null,
      400
    );
    expect(res.json).toHaveBeenCalledWith("mocked response");
  });

  it("should return 400 if password is incorrect", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "wrongpassword",
    });
    const res = mockResponse();

    const mockOrganizer = {
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
      role: "organizer",
    };
    (Organizer.findOne as jest.Mock).mockResolvedValue(mockOrganizer);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (apiResponse as jest.Mock).mockReturnValue("mocked response");

    await LoginOrganizer(req, res);

    expect(apiResponse).toHaveBeenCalledWith(false, "Password Salah ", 400);
    expect(res.json).toHaveBeenCalledWith("mocked response");
  });

  it("should return 200 and a token if login is successful", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    const res = mockResponse();

    const mockOrganizer = {
      id: "123",
      email: "test@example.com",
      password: "hashedpassword",
      role: "organizer",
    };
    (Organizer.findOne as jest.Mock).mockResolvedValue(mockOrganizer);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mockedToken");
    (apiResponse as jest.Mock).mockReturnValue("mocked response");

    await LoginOrganizer(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { organizerId: mockOrganizer.id },
      expect.any(String),
      { expiresIn: "24h" }
    );
    expect(apiResponse).toHaveBeenCalledWith(
      true,
      "Berhasil Login ",
      { token: "mockedToken", role: "organizer" },
      200
    );
    expect(res.json).toHaveBeenCalledWith("mocked response");
  });

  it("should return 500 if an error occurs", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "password123",
    });
    const res = mockResponse();

    (Organizer.findOne as jest.Mock).mockRejectedValue(
      new Error("Database Error")
    );
    (apiResponse as jest.Mock).mockReturnValue("mocked response");

    await LoginOrganizer(req, res);

    expect(apiResponse).toHaveBeenCalledWith(
      false,
      "Terjadi Kesalahan Saat Login",
      null,
      500
    );
    expect(res.json).toHaveBeenCalledWith("mocked response");
  });
});
