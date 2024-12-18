import { Request, Response } from "express";
import * as dashboardController from "../../controllers/dashboardController";
import User from "../../models/User";
import Event from "../../models/Event";
import Organizer from "../../models/Organizer";
import apiResponse from "../../utils/apiResource";

jest.mock("../../models/User");
jest.mock("../../models/Event");
jest.mock("../../models/Organizer");
jest.mock("../../utils/apiResource");

describe("Dashboard Controller Tests", () => {
  describe("getDashboardStats", () => {
    it("should return dashboard statistics successfully", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      User.countDocuments = jest.fn().mockResolvedValue(100);
      Event.countDocuments = jest.fn().mockResolvedValue(10);
      Organizer.countDocuments = jest.fn().mockResolvedValue(5);

      const mockReq = {} as Request;

      await dashboardController.getDashboardStats(mockReq, mockRes);

      expect(User.countDocuments).toHaveBeenCalled();
      expect(Event.countDocuments).toHaveBeenCalled();
      expect(Organizer.countDocuments).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil mendapatkan statistik dashboard",
          {
            totalUsers: 100,
            totalEvents: 10,
            totalOrganizers: 5,
          },
          200
        )
      );
    });

    it("should handle errors when fetching dashboard statistics", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      User.countDocuments = jest
        .fn()
        .mockRejectedValue(new Error("Error fetching users"));

      const mockReq = {} as Request;

      await dashboardController.getDashboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mendapatkan statistik dashboard",
          expect.any(Error),
          500
        )
      );
    });
  });

  describe("getDataUser", () => {
    it("should return user data with pagination", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockReq = {
        query: {
          page: "1",
          limit: "6",
        },
      } as unknown as Request;

      const mockUsers = [
        { _id: 1, username: "testUser", email: "test@example.com" },
      ];

      User.aggregate = jest.fn().mockResolvedValue(mockUsers);
      User.countDocuments = jest.fn().mockResolvedValue(1);

      await dashboardController.getDataUser(mockReq, mockRes);

      expect(User.aggregate).toHaveBeenCalled();
      expect(User.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil Mendapatkan Data User",
          {
            data: mockUsers,
            pagination: {
              total: 1,
              page: 1,
              lastPage: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          200
        )
      );
    });

    it("should return 404 if no users found", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockReq = {
        query: {
          page: "1",
          limit: "6",
        },
      } as unknown as Request;

      User.aggregate = jest.fn().mockResolvedValue([]);
      User.countDocuments = jest.fn().mockResolvedValue(0);

      await dashboardController.getDataUser(mockReq, mockRes);

      expect(User.aggregate).toHaveBeenCalled();
      expect(User.countDocuments).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Tidak Tersedia", "No users found", 404)
      );
    });

    it("should handle errors when fetching user data", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockReq = {
        query: {
          page: "1",
          limit: "6",
        },
      } as unknown as Request;

      User.aggregate = jest
        .fn()
        .mockRejectedValue(new Error("Error fetching users"));

      await dashboardController.getDataUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Tidak Tersedia", expect.any(Error), 404)
      );
    });
  });
});
