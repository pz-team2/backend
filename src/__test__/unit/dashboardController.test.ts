import { Request, Response } from "express";
import * as dashboardController from "../../controllers/dashboardController";
import User from "../../models/User";
import Event from "../../models/Event";
import Organizer from "../../models/Organizer";
import apiResponse from "../../utils/apiResource";
import Payment from "../../models/Payment";

jest.mock("../../models/User");
jest.mock("../../models/Event");
jest.mock("../../models/Organizer");
jest.mock("../../models/Payment");
jest.mock("../../utils/apiResource");

describe("Dashboard Controller Tests", () => {
  describe("getDashboardStats", () => {
    it("should return dashboard statistics successfully", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mocking the countDocuments method
      User.countDocuments = jest.fn().mockResolvedValue(100);
      Event.countDocuments = jest.fn().mockResolvedValue(10);
      Organizer.countDocuments = jest.fn().mockResolvedValue(5);

      const mockReq = {} as Request;

      await dashboardController.getDashboardStats(mockReq, mockRes);

      expect(User.countDocuments).toHaveBeenCalled();
      expect(Event.countDocuments).toHaveBeenCalled();
      expect(Organizer.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil mendapatkan statistik dashboard", {
          totalUsers: 100,
          totalEvents: 10,
          totalOrganizers: 5,
        })
      );
    });

    it("should handle errors when fetching dashboard statistics", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Simulate error in countDocuments
      User.countDocuments = jest.fn().mockRejectedValue(new Error("Error"));

      const mockReq = {} as Request;

      await dashboardController.getDashboardStats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mendapatkan statistik dashboard",
          new Error("Error")
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

      // Mocking User.aggregate and countDocuments
      const mockUsers = [
        { _id: 1, username: "testUser", email: "test@example.com" },
      ];
      const totalUsers = 1;
      User.aggregate = jest.fn().mockResolvedValue(mockUsers);
      User.countDocuments = jest.fn().mockResolvedValue(totalUsers);

      await dashboardController.getDataUser(mockReq, mockRes);

      expect(User.aggregate).toHaveBeenCalled();
      expect(User.countDocuments).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Berhasil Mendapatkan Data User",
        data: {
          data: mockUsers,
          pagination: {
            total: totalUsers,
            page: 1,
            lastPage: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
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

      // Mocking User.aggregate to return an empty array
      User.aggregate = jest.fn().mockResolvedValue([]);
      User.countDocuments = jest.fn().mockResolvedValue(0);

      await dashboardController.getDataUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Data Tidak Tersedia",
        data: { message: "No users found" },
      });
    });

    // it("should handle errors when fetching user data", async () => {
    //   const mockRes = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   } as unknown as Response;

    //   const mockReq = {
    //     query: {},
    //   } as unknown as Request;

    //   // Simulate error in User.aggregate
    //   User.aggregate = jest
    //     .fn()
    //     .mockRejectedValue(new Error("Error fetching users"));

    //   await dashboardController.getDataUser(mockReq, mockRes);

    //   expect(mockRes.status).toHaveBeenCalledWith(500);
    //   expect(mockRes.json).toHaveBeenCalledWith({
    //     success: false,
    //     message: "Data Tidak Tersedia",
    //     data: { message: "Error fetching users" },
    //   });
    // });
  });
});
