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
jest.mock("moment-timezone", () => {
  const original = jest.requireActual("moment-timezone");
  return {
    ...original,
    tz: jest.fn().mockReturnValue({
      format: jest.fn().mockReturnValue("2024-01-01 00:00:00"),
    }),
  };
});

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
    it("should return all organizers", async () => {
      const mockOrganizers = [{ id: "1", username: "Organizer A" }];
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

    it("should handle errors", async () => {
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

  describe("getOrganizerByRole", () => {
    it("should return organizers with role 'organizer'", async () => {
      const mockOrganizers = [{ id: "1", role: "organizer" }];
      (Organizer.find as jest.Mock).mockResolvedValue(mockOrganizers);

      await getOrganizerByRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Berhasil", mockOrganizers, 200)
      );
    });

    it("should handle errors", async () => {
      (Organizer.find as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await getOrganizerByRole(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Data Tidak Berhasil", expect.any(Error), 404)
      );
    });
  });

  describe("createOrganizer", () => {
    it("should create a new organizer", async () => {
      const mockBody = {
        username: "testUser",
        email: "test@example.com",
        password: "password123",
        role: "organizer",
      };
      mockRequest.body = mockBody;

      (Organizer.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (Organizer.prototype.save as jest.Mock).mockResolvedValue(mockBody);

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Organizer berhasil ditambahkan", mockBody, 201)
      );
    });

    it("should return 400 if email already exists", async () => {
      mockRequest.body = { email: "test@example.com" };
      (Organizer.findOne as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      await createOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Email sudah terdaftar", null, 400)
      );
    });
  });

  describe("getOrganizerById", () => {
    it("should return an organizer by ID with status 200", async () => {
      const mockOrganizer = { id: "1", username: "Organizer A" };

      mockRequest.params = { id: "1" };
      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Mendapatkan organizer", mockOrganizer, 200)
      );
    });

    it("should return 404 if the organizer is not found", async () => {
      mockRequest.params = { id: "1" };
      (Organizer.findById as jest.Mock).mockResolvedValue(null);

      await getOrganizerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer Tidak ditemukan", 404)
      );
    });

    it("should return 500 if there is a server error", async () => {
      mockRequest.params = { id: "1" };
      (Organizer.findById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

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

  describe("updateOrganizer", () => {
    it("should update organizer successfully with status 200", async () => {
      const mockOrganizerId = "1";
      const mockUpdatedData = {
        username: "Updated Name",
        phoneNumber: "123456789",
        organizerName: "Updated Organizer",
        email: "updated@example.com",
        status: "active",
      };

      mockRequest.params = { id: mockOrganizerId };
      mockRequest.body = mockUpdatedData;

      const mockUpdatedOrganizer = { ...mockUpdatedData, id: mockOrganizerId };
      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedOrganizer
      );

      await updateOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Organizer berhasil diperbarui",
          mockUpdatedOrganizer,
          200
        )
      );
    });

    it("should return 404 if the organizer is not found", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };
      mockRequest.body = { username: "Updated Name" };

      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer tidak ditemukan", 404)
      );
    });

    it("should return 500 if there is a server error", async () => {
      const mockOrganizerId = "1";
      mockRequest.params = { id: mockOrganizerId };
      mockRequest.body = { username: "Updated Name" };

      (Organizer.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await updateOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal memperbarui organizer",
          expect.any(Error),
          500
        )
      );
    });
  });

  describe("updatepassword", () => {
    it("should update the password if valid", async () => {
      mockRequest.body = {
        password: "currentPassword",
        pwbaru: "newPassword123",
        confirmpw: "newPassword123",
      };
      mockRequest.organizer = { id: "1" } as any;

      (Organizer.findById as jest.Mock).mockResolvedValue({
        password: "hashedPassword",
        save: jest.fn(),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");

      await updatepassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil Update Password", 200)
      );
    });

    it("should return 404 if current password is incorrect", async () => {
      mockRequest.body = { password: "wrongPassword" };
      mockRequest.organizer = { id: "1" } as any;

      (Organizer.findById as jest.Mock).mockResolvedValue({
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await updatepassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Password Yang Masukan Saat Ini Salah", 404)
      );
    });
  });

  describe("getOrganizerByOne", () => {
    it("should return organizer data by their ID", async () => {
      mockRequest.organizer = { id: "1" } as any;

      const mockOrganizer = { id: "1", username: "Organizer A" };
      (Organizer.findById as jest.Mock).mockResolvedValue(mockOrganizer);

      await getOrganizerByOne(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Successfully retrieved organizer",
          mockOrganizer,
          200
        )
      );
    });

    it("should return 404 if organizer not found", async () => {
      mockRequest.organizer = { id: "1" } as any;
      (Organizer.findById as jest.Mock).mockResolvedValue(null);

      await getOrganizerByOne(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer not found", null, 404)
      );
    });
  });

  describe("getEventsByOrganizerLatest", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockRequest = {
        organizer: { id: "organizerId" },
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    // it("should return the latest events for an organizer", async () => {
    //   const mockEvents = [
    //     {
    //       _id: "1",
    //       title: "Event A",
    //       date: new Date(),
    //       organizer: "organizerId",
    //       picture: "image.jpg",
    //       status: "active",
    //     },
    //     {
    //       _id: "2",
    //       title: "Event B",
    //       date: new Date(),
    //       organizer: "organizerId",
    //       picture: "image2.jpg",
    //       status: "active",
    //     },
    //   ];

    //   const mockTiketTerjual = [{ _id: null, total: 5 }];

    //   (Event.find as jest.Mock).mockResolvedValue(mockEvents);
    //   (Payment.aggregate as jest.Mock).mockResolvedValue(mockTiketTerjual);

    //   await getEventsByOrganizerLatest(
    //     mockRequest as Request,
    //     mockResponse as Response
    //   );

    //   expect(mockResponse.status).toHaveBeenCalledWith(200);
    //   expect(mockResponse.json).toHaveBeenCalledWith(
    //     apiResponse(
    //       true,
    //       "Berhasil mendapatkan event terbaru",
    //       expect.arrayContaining([
    //         expect.objectContaining({
    //           id: "1",
    //           title: "Event A",
    //           ticketsSold: 5,
    //         }),
    //       ]),
    //       200
    //     )
    //   );
    // });

    it("should return 404 if no events are found", async () => {
      (Event.find as jest.Mock).mockResolvedValue([]);

      await getEventsByOrganizerLatest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
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

  describe("updateOrganizerById", () => {
    it("should update organizer by their ID", async () => {
      mockRequest.organizer = { id: "1" } as any;
      mockRequest.body = {
        username: "newUsername",
        phoneNumber: "123456789",
        organizerName: "Organizer Baru",
        email: "organizer@example.com",
      };

      const mockUpdatedOrganizer = { id: "1", username: "Updated Name" };
      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedOrganizer
      );

      await updateOrganizerById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Organizer berhasil diperbarui",
          mockUpdatedOrganizer,
          200
        )
      );
    });

    it("should return 404 if organizer not found (due to incomplete data or non-existing organizer)", async () => {
      mockRequest.organizer = { id: "1" } as any;
      mockRequest.body = { username: "newUsername" };
      const mockUpdatedOrganizer = null;
      (Organizer.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockUpdatedOrganizer
      );

      await updateOrganizerById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer tidak ditemukan", 404)
      );
    });
  });

  describe("deleteOrganizer", () => {
    it("should delete an organizer by ID", async () => {
      mockRequest.params = { id: "1" };

      const mockDeletedOrganizer = { id: "1", username: "Deleted Organizer" };
      (Organizer.findByIdAndDelete as jest.Mock).mockResolvedValue(
        mockDeletedOrganizer
      );

      await deleteOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Organizer berhasil dihapus", 200)
      );
    });

    it("should return 404 if organizer not found", async () => {
      mockRequest.params = { id: "1" };
      (Organizer.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteOrganizer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Organizer tidak ditemukan", 404)
      );
    });
  });

  // describe("getEventsByOrganizer", () => {
  //   it("should return events filtered and paginated by organizer", async () => {
  //     // Setup mock request
  //     mockRequest.organizer = { id: "organizerId" };
  //     mockRequest.query = {
  //       page: "1",
  //       limit: "2",
  //       status: "active",
  //       startDate: "2023-01-01",
  //       endDate: "2023-12-31",
  //       sortBy: "date",
  //       sortOrder: "desc",
  //     };

  //     // Mock data
  //     const mockEvents = [
  //       {
  //         _id: "1",
  //         title: "Event A",
  //         organizer: "organizerId",
  //         date: new Date(),
  //         category: { name: "Category A" },
  //       },
  //       {
  //         _id: "2",
  //         title: "Event B",
  //         organizer: "organizerId",
  //         date: new Date(),
  //         category: { name: "Category B" },
  //       },
  //     ];

  //     const totalEvents = 5;

  //     // Mock Event.countDocuments
  //     (Event.countDocuments as jest.Mock).mockResolvedValueOnce(totalEvents);

  //     // Mock Event.find chainable methods
  //     (Event.find as jest.Mock).mockReturnValueOnce({
  //       sort: jest.fn().mockReturnThis(),
  //       skip: jest.fn().mockReturnThis(),
  //       limit: jest.fn().mockReturnThis(),
  //       populate: jest.fn().mockResolvedValueOnce(mockEvents),
  //     });

  //     // Call the controller
  //     await getEventsByOrganizer(
  //       mockRequest as Request,
  //       mockResponse as Response
  //     );

  //     // Expected response
  //     const expectedResponse = {
  //       data: mockEvents,
  //       pagination: {
  //         total: totalEvents,
  //         page: 1,
  //         lastPage: Math.ceil(totalEvents / 2),
  //         hasNextPage: 1 < Math.ceil(totalEvents / 2),
  //         hasPrevPage: 1 > 1,
  //       },
  //     };

  //     // Verify results
  //     expect(mockResponse.status).toHaveBeenCalledWith(200);
  //     expect(mockResponse.json).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         success: true,
  //         message: "Berhasil mendapatkan event organizer",
  //         data: expectedResponse,
  //       })
  //     );
  //   });
  // });

  describe("getOrganizerStats", () => {
    it("should return stats for an organizer", async () => {
      mockRequest.organizer = { _id: "organizerId" } as any;

      const mockEvents = [{ _id: "1" }, { _id: "2" }];
      const mockStats = [
        { totalRevenue: 10000, totalTransactions: 10, totalTicketsSold: 100 },
      ];

      (Event.find as jest.Mock).mockResolvedValue(mockEvents);
      (Payment.aggregate as jest.Mock).mockResolvedValue(mockStats);

      await getOrganizerStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(true, "Berhasil mendapatkan data dashboard", {
          revenue: 10000,
          transactions: 10,
          ticketsSold: 100,
        })
      );
    });

    it("should return 404 if no events are found", async () => {
      mockRequest.organizer = { _id: "organizerId" } as any;

      (Event.find as jest.Mock).mockResolvedValue([]);

      await getOrganizerStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        apiResponse(false, "Tidak ada event terkait dengan organizer ini", 404)
      );
    });
  });
});
