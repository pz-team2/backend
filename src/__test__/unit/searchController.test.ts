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

  beforeEach(() => {
    mockJson = jest.fn();
    mockReq = {};
    mockRes = {
      json: mockJson,
    };

    // Reset mocks for apiResponse
    (apiResponse as jest.Mock).mockClear();
  });

  describe("searchUsers", () => {
    it("should return error if no query provided", async () => {
      mockReq.query = {};

      // Setup mock for apiResponse before calling the function
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Query pencarian diperlukan",
        data: null,
        status: 400,
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Query pencarian diperlukan",
        null,
        400
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Query pencarian diperlukan",
        })
      );
    });

    it("should search users successfully", async () => {
      const mockUsers = [
        {
          username: "testuser",
          email: "test@example.com",
          fullName: "Test User",
          city: "Test City",
        },
      ];

      mockReq.query = { query: "test" };

      // Mock User.find chain
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockUsers),
        }),
      });

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari users",
        data: mockUsers,
        status: 200,
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari users",
        mockUsers,
        200
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mencari users",
          data: mockUsers,
        })
      );
    });

    it("should handle search users error", async () => {
      mockReq.query = { query: "test" };

      // Simulate an error
      (User.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian users",
        data: expect.any(Error),
        status: 500,
      });

      await searchUsers(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian users",
        expect.any(Error),
        500
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Gagal melakukan pencarian users",
        })
      );
    });
  });

  describe("searchEvents", () => {
    it("should search events with multiple filters", async () => {
      const mockEvents = [
        {
          title: "Test Event",
          description: "Test Description",
          address: "Test Address",
          category: { name: "Music" },
          organizer: { organizerName: "Test Organizer" },
          price: 50,
          date: new Date("2023-06-15"),
          status: "active",
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

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari events",
        data: mockEvents,
        status: 200,
      });

      await searchEvents(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari events",
        mockEvents,
        200
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mencari events",
          data: mockEvents,
        })
      );
    });

    it("should handle search events error", async () => {
      mockReq.query = { query: "test" };

      // Simulate an error
      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian events",
        data: expect.any(Error),
        status: 500,
      });

      await searchEvents(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian events",
        expect.any(Error),
        500
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Gagal melakukan pencarian events",
        })
      );
    });
  });

  describe("searchEventsByOrganizer", () => {
    it("should return error if no organizerId provided", async () => {
      mockReq.params = {};

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "ID Organizer diperlukan",
        data: null,
        status: 400,
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "ID Organizer diperlukan",
        400
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "ID Organizer diperlukan",
        })
      );
    });

    it("should search events by organizer successfully", async () => {
      const mockEvents = [
        {
          title: "Organizer Event",
          category: { name: "Music" },
          organizer: { organizerName: "Test Organizer" },
          date: new Date("2023-06-15"),
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

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Berhasil mencari events berdasarkan organizer",
        data: mockEvents,
        status: 200,
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mencari events berdasarkan organizer",
        mockEvents,
        200
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mencari events berdasarkan organizer",
          data: mockEvents,
        })
      );
    });

    it("should handle search events by organizer error", async () => {
      const mockOrganizerId = new mongoose.Types.ObjectId();
      mockReq.params = { organizerId: mockOrganizerId.toString() };

      // Simulate an error
      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Setup mock for apiResponse
      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Gagal melakukan pencarian events by organizer",
        data: expect.any(Error),
        status: 500,
      });

      await searchEventsByOrganizer(mockReq as Request, mockRes as Response);

      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal melakukan pencarian events by organizer",
        expect.any(Error),
        500
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Gagal melakukan pencarian events by organizer",
        })
      );
    });
  });
});
