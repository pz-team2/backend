import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  searchUsers,
  searchEvents,
  searchEventsByOrganizer,
} from "../../controllers/searchController";
import User from "../../models/User";
import Event from "../../models/Event";
import apiResponse from "../../utils/apiResource";

jest.mock("../../models/User");
jest.mock("../../models/Event");
jest.mock("../../utils/apiResource");

describe("Search Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {};
    mockRes = {
      status: mockStatus,
    };

    // Reset mocks for apiResponse
    (apiResponse as jest.Mock).mockClear();
  });

  describe("searchUsers", () => {
    it("should return error if no query provided", async () => {
      mockReq.query = {};

      // Mock apiResponse to return a specific object
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Query pencarian diperlukan",
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Query pencarian diperlukan"
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Query pencarian diperlukan",
      });
    });

    it("should search users successfully", async () => {
      const mockUsers = [
        {
          username: "testuser",
          email: "test@example.com",
          fullName: "Test User",
        },
      ];

      mockReq.query = { query: "test" };

      // Mock User.find chain
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUsers),
        }),
      });

      // Mock apiResponse to return a specific object
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari users",
        data: mockUsers,
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari users",
        mockUsers
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Berhasil mencari users",
        data: mockUsers,
      });
    });

    it("should handle search users error", async () => {
      mockReq.query = { query: "test" };

      // Simulate an error
      (User.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Mock apiResponse to return a specific object
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian users",
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian users",
        expect.any(Error)
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Gagal melakukan pencarian users",
      });
    });
  });

  // Lanjutan dari kode sebelumnya
  describe("searchEvents", () => {
    it("should search events with multiple filters", async () => {
      const mockEvents = [
        {
          title: "Test Event",
          category: { name: "Music" },
          organizer: { organizerName: "Test Organizer" },
        },
      ];

      mockReq.query = {
        query: "test",
        category: "music",
        minPrice: "10",
        maxPrice: "100",
        date: "2023-06-15",
        status: "active",
        organizer: "org123",
      };

      // Mock event find chain
      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockEvents),
          }),
        }),
      });

      // Mock apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari events",
        data: mockEvents,
      });

      await searchEvents(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari events",
        mockEvents
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Berhasil mencari events",
        data: mockEvents,
      });
    });

    it("should handle search events error", async () => {
      mockReq.query = { query: "test" };

      // Simulate an error
      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Mock apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian events",
      });

      await searchEvents(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian events",
        expect.any(Error)
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Gagal melakukan pencarian events",
      });
    });
  });

  describe("searchEventsByOrganizer", () => {
    it("should return error if no organizerId provided", async () => {
      mockReq.params = {};

      // Mock apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "ID Organizer diperlukan",
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "ID Organizer diperlukan"
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "ID Organizer diperlukan",
      });
    });

    it("should search events by organizer successfully", async () => {
      const mockEvents = [
        {
          title: "Organizer Event",
          category: { name: "Music" },
          organizer: { organizerName: "Test Organizer" },
        },
      ];

      const mockOrganizerId = new mongoose.Types.ObjectId();
      mockReq.params = { organizerId: mockOrganizerId.toString() };

      // Mock event find chain
      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockEvents),
          }),
        }),
      });

      // Mock apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari events berdasarkan organizer",
        data: mockEvents,
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari events berdasarkan organizer",
        mockEvents
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Berhasil mencari events berdasarkan organizer",
        data: mockEvents,
      });
    });

    it("should handle search events by organizer error", async () => {
      const mockOrganizerId = new mongoose.Types.ObjectId();
      mockReq.params = { organizerId: mockOrganizerId.toString() };

      // Simulate an error
      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Mock apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian events by organizer",
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian events by organizer",
        expect.any(Error)
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Gagal melakukan pencarian events by organizer",
      });
    });
  });
});
