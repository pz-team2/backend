import { Request, Response } from "express";
import {
  createOrganizer,
  getOrganizerById,
  getOrganizers,
} from "../../controllers/organizerController";
import apiResponse from "../../utils/apiResource";
import Organizer from "../../models/Organizer";

// Mock models and utilities
jest.mock("../../models/Organizer");
jest.mock("../../utils/apiResource");

describe("Organizer Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getOrganizers", () => {
    it("should return all organizers with status 200", async () => {
      const mockOrganizers = [
        { id: "1", name: "Organizer A" },
        { id: "2", name: "Organizer B" },
      ];

      (Organizer.find as jest.Mock).mockResolvedValue(mockOrganizers);

      await getOrganizers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil mendapatkan Data Organizer",
          mockOrganizers,
          200
        )
      );
    });

    it("should return status 500 on error", async () => {
      (Organizer.find as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await getOrganizers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mendapatkan organizer",
          expect.any(Error),
          500
        )
      );
    });
  });

  describe("getOrganizerById", () => {
    it("should return an organizer by ID with status 200", async () => {
      const mockOrganizer = { id: "1", name: "Organizer A" };
      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);

      mockRequest.params = { id: "1" };

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Mendapatkan organizer", mockOrganizer, 200)
      );
    });

    it("should return 404 if organizer not found", async () => {
      (Organizer.findById as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: "1" };

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer Tidak ditemukan", 404)
      );
    });

    it("should return status 500 on error", async () => {
      (Organizer.findById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      mockRequest.params = { id: "1" };

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal Mendapatkan organizer",
          expect.any(Error),
          500
        )
      );
    });
  });

  describe("createOrganizer", () => {
    it("should create a new organizer and return 201", async () => {
      const mockBody = {
        username: "testUser",
        email: "test@example.com",
        password: "password123",
        role: "organizer",
        phoneNumber: "123456789",
        organizerName: "Test Organizer",
        status: "active",
      };

      mockRequest.body = mockBody;
      (Organizer.findOne as jest.Mock).mockResolvedValue(null);
      (Organizer.prototype.save as jest.Mock).mockResolvedValue(mockBody);

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Organizer berhasil ditambahkan", mockBody, 201)
      );
    });

    it("should return 400 if email is already registered", async () => {
      const mockBody = {
        email: "test@example.com",
      };

      mockRequest.body = mockBody;
      (Organizer.findOne as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Email sudah terdaftar", null, 400)
      );
    });

    it("should return 500 on error", async () => {
      mockRequest.body = { email: "test@example.com" };
      (Organizer.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal menambahkan organizer",
          expect.any(Error),
          500
        )
      );
    });
  });
});
