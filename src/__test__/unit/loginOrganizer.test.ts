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
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
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

    await LoginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      apiResponse(false, "Email Tidak  Ditemukan")
    );
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
    };
    (Organizer.findOne as jest.Mock).mockResolvedValue(mockOrganizer);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await LoginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      apiResponse(false, "Password Salah ")
    );
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

    await LoginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      apiResponse(true, "Berhasil Login ", {
        token: "mockedToken",
        role: "organizer",
      })
    );
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

    await LoginOrganizer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      apiResponse(false, "Terjadi Kesalahan Saat Login")
    );
  });
});
