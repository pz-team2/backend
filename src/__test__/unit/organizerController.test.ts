import { Request, Response } from "express";
import {
  getOrganizers,
  getOrganizerByRole,
  getOrganizerById,
  getOrganizerByOne,
  getEventsByOrganizerLatest,
  createOrganizer,
  updateOrganizer,
  updatepassword,
  updateOrganizerById,
  deleteOrganizer,
  getEventsByOrganizer,
  getOrganizerStats,
} from "../../controllers/organizerController";
import Organizer from "../../models/Organizer";
import Event from "../../models/Event";
import Payment from "../../models/Payment";
import bcrypt from "bcryptjs";
import apiResponse from "../../utils/apiResource";
import moment from "moment-timezone";

jest.mock("../../models/Organizer");
jest.mock("../../models/Event");
jest.mock("../../models/Payment");
jest.mock("bcryptjs");
jest.mock("../../utils/apiResource", () => jest.fn());
jest.mock("moment-timezone");

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
    it("should return all organizers successfully", async () => {
      const mockOrganizers = [{ id: "1", username: "Organizer A" }];
      (Organizer.find as jest.Mock).mockResolvedValue(mockOrganizers);

      await getOrganizers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil mendapatkan Data Organizer",
          mockOrganizers,
          200
        )
      );
    });

    it("should handle errors when fetching organizers", async () => {
      const mockError = new Error("Database error");
      (Organizer.find as jest.Mock).mockRejectedValue(mockError);

      await getOrganizers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Gagal mendapatkan organizer", mockError, 500)
      );
    });
  });

  describe("getOrganizerByRole", () => {
    it("should return organizers with role 'organizer'", async () => {
      const mockOrganizers = [{ id: "1", role: "organizer" }];
      (Organizer.find as jest.Mock).mockResolvedValue(mockOrganizers);

      await getOrganizerByRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Berhasil", mockOrganizers, 200)
      );
    });

    it("should handle errors when fetching organizers by role", async () => {
      const mockError = new Error("Database error");
      (Organizer.find as jest.Mock).mockRejectedValue(mockError);

      await getOrganizerByRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Tidak Berhasil", mockError, 404)
      );
    });
  });

  describe("createOrganizer", () => {
    it("should create a new organizer successfully", async () => {
      const mockBody = {
        username: "testUser",
        email: "test@example.com",
        password: "password123",
        role: "organizer",
        phoneNumber: "1234567890",
        organizerName: "Test Organizer",
        status: "active",
      };
      mockRequest.body = mockBody;

      (Organizer.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      const mockSavedOrganizer = { ...mockBody, password: "hashedPassword" };
      (Organizer.prototype.save as jest.Mock).mockResolvedValue(
        mockSavedOrganizer
      );

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Organizer berhasil ditambahkan",
          expect.objectContaining({
            username: "testUser",
            email: "test@example.com",
          }),
          201
        )
      );
    });

    it("should return 400 if email already exists", async () => {
      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };
      (Organizer.findOne as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Email sudah terdaftar", null, 400)
      );
    });
  });

  describe("updatepassword", () => {
    it("should update password successfully", async () => {
      mockRequest.body = {
        password: "currentPassword",
        pwbaru: "newPassword123",
        confirmpw: "newPassword123",
      };
      mockRequest.organizer = { id: "1" } as any;

      const mockOrganizer = {
        _id: "1",
        password: "hashedCurrentPassword",
        save: jest.fn(),
      };

      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

      await updatepassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Update Password", 200)
      );
    });

    it("should return error if current password is incorrect", async () => {
      mockRequest.body = {
        password: "wrongCurrentPassword",
        pwbaru: "newPassword123",
        confirmpw: "newPassword123",
      };
      mockRequest.organizer = { id: "1" } as any;

      const mockOrganizer = {
        _id: "1",
        password: "hashedCurrentPassword",
      };

      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await updatepassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Password Yang Masukan Saat Ini Salah", 404)
      );
    });
  });

  describe("getOrganizerStats", () => {
    it("should return organizer stats successfully", async () => {
      const mockOrganizerId = "organizerId";
      mockRequest.organizer = { _id: mockOrganizerId } as any;

      const mockEvents = [{ _id: "event1" }, { _id: "event2" }];
      (Event.find as jest.Mock).mockResolvedValue(mockEvents);

      const mockStats = [
        {
          totalRevenue: 10000,
          totalTransactions: 5,
          totalTicketsSold: 50,
        },
      ];
      (Payment.aggregate as jest.Mock).mockResolvedValue(mockStats);

      await getOrganizerStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil mendapatkan data dashboard",
          {
            revenue: 10000,
            transactions: 5,
            ticketsSold: 50,
          },
          200
        )
      );
    });

    it("should return 404 if no events are found", async () => {
      mockRequest.organizer = { _id: "organizerId" } as any;

      (Event.find as jest.Mock).mockResolvedValue([]);

      await getOrganizerStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Tidak ada event terkait dengan organizer ini", 404)
      );
    });
  });
  // Add these to the existing test suite

  describe("getOrganizerById", () => {
    it("should return organizer when found successfully", async () => {
      const mockOrganizerId = "1";
      const mockOrganizer = {
        _id: mockOrganizerId,
        username: "Test Organizer",
        email: "test@example.com",
      };

      mockRequest.params = { id: mockOrganizerId };
      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Mendapatkan organizer", mockOrganizer, 200)
      );
    });

    it("should return 404 when organizer is not found", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };

      (Organizer.findById as jest.Mock).mockResolvedValue(null);

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer Tidak ditemukan", 404)
      );
    });

    it("should handle server errors", async () => {
      const mockOrganizerId = "1";
      const mockError = new Error("Database error");

      mockRequest.params = { id: mockOrganizerId };
      (Organizer.findById as jest.Mock).mockRejectedValue(mockError);

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Gagal Mendapatkan organizer", mockError, 500)
      );
    });
  });

  describe("getOrganizerByOne", () => {
    it("should return organizer details for authenticated user", async () => {
      const mockOrganizerId = "1";
      const mockOrganizer = {
        _id: mockOrganizerId,
        username: "Test Organizer",
        email: "test@example.com",
      };

      mockRequest.organizer = { id: mockOrganizerId } as any;
      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);

      await getOrganizerByOne(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Successfully retrieved organizer",
          mockOrganizer,
          200
        )
      );
    });

    it("should return 404 when organizer is not found", async () => {
      const mockOrganizerId = "1";

      mockRequest.organizer = { id: mockOrganizerId } as any;
      (Organizer.findById as jest.Mock).mockResolvedValue(null);

      await getOrganizerByOne(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer not found", null, 404)
      );
    });
  });

  describe("getEventsByOrganizerLatest", () => {
    // it("should return latest events for an organizer", async () => {
    //   const mockOrganizerId = "organizerId";
    //   mockRequest.organizer = { id: mockOrganizerId } as any;

    //   const mockEvents = [
    //     {
    //       _id: "event1",
    //       title: "Event 1",
    //       date: new Date(),
    //       picture: "picture1.jpg",
    //       status: "active",
    //       organizer: { organizerName: "Test Organizer" },
    //     },
    //   ];

    //   const mockPaymentAggregation = [{ total: 10 }];

    //   (Event.find as jest.Mock).mockReturnValue({
    //     populate: jest.fn().mockReturnValue({
    //       sort: jest.fn().mockResolvedValue(mockEvents),
    //     }),
    //   });

    //   (moment as any).tz.mockReturnValue({
    //     format: jest.fn().mockReturnValue("2024-01-01 00:00:00"),
    //   });

    //   (Payment.aggregate as jest.Mock).mockResolvedValue(
    //     mockPaymentAggregation
    //   );

    //   await getEventsByOrganizerLatest(
    //     mockRequest as Request,
    //     mockResponse as Response
    //   );

    //   expect(mockResponse.json).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       status: true,
    //       message: "Berhasil mendapatkan event terbaru",
    //       statusCode: 200,
    //     })
    //   );
    // });

    it("should handle error when fetching latest events fails", async () => {
      const mockOrganizerId = "organizerId";
      mockRequest.organizer = { id: mockOrganizerId } as any;

      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Fetch error");
      });

      await getEventsByOrganizerLatest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mendapatkan event terbaru",
          expect.any(Error),
          404
        )
      );
    });
  });

  describe("updateOrganizer", () => {
    it("should update organizer successfully", async () => {
      const mockOrganizerId = "1";
      const mockUpdateData = {
        username: "Updated Name",
        phoneNumber: "1234567890",
        organizerName: "Updated Organizer",
        email: "updated@example.com",
        status: "active",
      };

      mockRequest.params = { id: mockOrganizerId };
      mockRequest.body = mockUpdateData;

      const mockUpdatedOrganizer = {
        ...mockUpdateData,
        _id: mockOrganizerId,
      };

      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedOrganizer
      );

      await updateOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Organizer berhasil diperbarui",
          mockUpdatedOrganizer,
          200
        )
      );
    });

    it("should return 404 if organizer not found", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };
      mockRequest.body = { username: "Updated Name" };

      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer tidak ditemukan", 404)
      );
    });
  });

  describe("deleteOrganizer", () => {
    it("should delete organizer successfully", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };

      const mockDeletedOrganizer = {
        _id: mockOrganizerId,
        username: "Deleted Organizer",
      };

      (Organizer.findByIdAndDelete as jest.Mock).mockResolvedValue(
        mockDeletedOrganizer
      );

      await deleteOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Organizer berhasil dihapus", 200)
      );
    });

    it("should return 404 if organizer not found", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };

      (Organizer.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer tidak ditemukan", 404)
      );
    });
  });

  describe("getEventsByOrganizer", () => {
    it("should return paginated events for an organizer", async () => {
      const mockOrganizerId = "organizerId";
      mockRequest.organizer = { id: mockOrganizerId } as any;
      mockRequest.query = {
        page: "1",
        limit: "10",
        sortBy: "date",
        sortOrder: "desc",
      };

      const mockEvents = [
        {
          _id: "event1",
          title: "Event 1",
          category: { name: "Category 1" },
          organizer: {
            organizerName: "Test Organizer",
            email: "test@example.com",
            phoneNumber: "1234567890",
          },
        },
      ];

      const mockTotal = 1;

      (Event.countDocuments as jest.Mock).mockResolvedValue(mockTotal);
      (Event.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockEvents),
      });

      await getEventsByOrganizer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Berhasil mendapatkan event organizer",
          {
            data: mockEvents,
            pagination: {
              total: mockTotal,
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

    it("should handle errors when fetching events", async () => {
      const mockOrganizerId = "organizerId";
      mockRequest.organizer = { id: mockOrganizerId } as any;
      mockRequest.query = {};

      (Event.find as jest.Mock).mockImplementation(() => {
        throw new Error("Fetch error");
      });

      await getEventsByOrganizer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mendapatkan event organizer",
          expect.any(Error),
          500
        )
      );
    });
  });
});
