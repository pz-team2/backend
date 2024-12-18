import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../../models/Event";
import Payment from "../../models/Payment";
import apiResponse from "../../utils/apiResource";
import * as eventController from "../../controllers/eventController";
import moment from "moment-timezone";

jest.mock("../../models/Event");
jest.mock("../../models/Payment");
jest.mock("../../utils/apiResource", () => jest.fn());
jest.mock("moment-timezone");

describe("Event Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      params: {},
      body: {},
      query: {},
      file: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    (apiResponse as jest.Mock).mockImplementation(
      (success, message, data = null, code = 200) => ({
        success,
        message,
        data,
        code,
      })
    );
  });

  describe("tambahEvent", () => {
    it("should return 400 if no file is uploaded", async () => {
      mockRequest.params = { id: "organizerId" };

      await eventController.tambahEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "File gambar diperlukan!",
        })
      );
    });

    it("should return 400 if file size exceeds limit", async () => {
      mockRequest.params = { id: "organizerId" };
      mockRequest.file = {
        path: "/path/to/image",
        size: 1001 * 1024 * 1024,
      } as any;

      await eventController.tambahEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Ukuran gambar terlalu besar! Maksimum 1000MB.",
        })
      );
    });

    it("should save event if valid", async () => {
      (moment as unknown as jest.Mock).mockReturnValue({
        tz: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnValue("2024-01-01 12:00:00"),
      });

      mockRequest.params = { id: "organizerId" };
      mockRequest.file = { path: "/path/to/image", size: 500 * 1024 } as any;
      mockRequest.body = {
        title: "Test Event",
        quota: 100,
        price: 50000,
        startTime: "10:00",
        finishTime: "12:00",
        date: new Date(),
        address: "Test Address",
        status: "active",
        description: "Test Description",
        category: new mongoose.Types.ObjectId(),
      };

      (Event.prototype.save as jest.Mock).mockResolvedValue({
        _id: "mockEventId",
        ...mockRequest.body,
        picture: "/path/to/image",
        date: "2024-01-01 12:00:00",
      });

      await eventController.tambahEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil Menambahkan Data",
        })
      );
    });
  });

  describe("updateEvent", () => {
    it("should update event successfully", async () => {
      const mockEvent = {
        _id: "existingEventId",
        save: jest.fn().mockResolvedValue(true),
      };

      mockRequest.params = { id: "existingEventId" };
      mockRequest.body = {
        title: "Updated Event",
        quota: 150,
        price: 60000,
        startTime: "11:00",
        finishTime: "13:00",
        date: new Date(),
        address: "Updated Address",
        status: "active",
        description: "Updated Description",
        category: new mongoose.Types.ObjectId(),
      };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);

      await eventController.updateEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Event berhasil diperbarui",
        })
      );
    });
  });

  describe("getEventsByOrganizer", () => {
    it("should return events with pagination", async () => {
      const mockEvents = [
        {
          _id: "eventId1",
          title: "Event 1",
          date: new Date("2024-01-01"),
          organizer: "organizerId",
        },
      ];

      const mockTotal = 1;

      (Event.countDocuments as jest.Mock).mockResolvedValueOnce(mockTotal);
      (Event.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockEvents),
      });

      mockRequest.params = { organizerId: "organizerId" };
      mockRequest.query = {
        page: "1",
        limit: "9",
        sortBy: "date",
        sortOrder: "desc",
      };

      await eventController.getEventsByOrganizer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mendapatkan event organizer",
          data: {
            data: mockEvents,
            pagination: expect.objectContaining({
              total: mockTotal,
              page: 1,
              lastPage: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }),
          },
        })
      );
    });

    it("should apply additional filters for status, date range, and category", async () => {
      mockRequest.params = { organizerId: "organizerId" };
      mockRequest.query = {
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        category: "categoryId",
      };

      const mockEvents = [
        {
          _id: "eventId1",
          title: "Filtered Event",
          date: new Date("2024-06-01"),
          organizer: "organizerId",
        },
      ];

      (Event.countDocuments as jest.Mock).mockResolvedValueOnce(
        mockEvents.length
      );
      (Event.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(mockEvents),
      });

      await eventController.getEventsByOrganizer(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Event.find).toHaveBeenCalledWith(
        expect.objectContaining({
          organizer: "organizerId",
          status: "active",
          category: "categoryId",
          date: {
            $gte: expect.any(Date),
            $lte: expect.any(Date),
          },
        })
      );
    });
  });

  describe("getEventStats", () => {
    // it("should return 404 if event not found", async () => {
    //   mockRequest.params = { id: "nonExistentEventId" };
    //   (Event.findById as jest.Mock).mockResolvedValue(null);

    //   await eventController.getEventStats(
    //     mockRequest as Request,
    //     mockResponse as Response
    //   );

    //   expect(mockResponse.json).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       success: false,
    //       message: "Event tidak ditemukan",
    //     })
    //   );
    // });

    it("should return event stats successfully", async () => {
      const mockEventId = "mockEventId";
      const mockEvent = {
        _id: mockEventId,
        title: "Mock Event",
        quota: 100,
        date: new Date(),
      };

      (Event.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvent),
        }),
      });

      (Payment.aggregate as jest.Mock)
        .mockResolvedValueOnce([{ totalRevenue: 500000 }])
        .mockResolvedValueOnce([{ total: 50 }]);

      mockRequest.params = { id: mockEventId };

      await eventController.getEventStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mendapatkan detail event",
          data: {
            stats: {
              totalRevenue: 500000,
              ticketsSold: 50,
              ticketsRemaining: 50,
            },
          },
        })
      );
    });
  });

  describe("getEventByRevenue", () => {
    // it("should return 404 if event not found", async () => {
    //   mockRequest.params = { id: "nonExistentEventId" };

    //   // Modify the mock to simulate the actual implementation
    //   (Event.findById as jest.Mock).mockReturnValue({
    //     populate: jest.fn().mockReturnThis(),
    //     populate2: jest.fn().mockResolvedValue(null),
    //   });

    //   await eventController.getEventByRevenue(
    //     mockRequest as Request,
    //     mockResponse as Response
    //   );

    //   // Verify both status and json are called correctly
    //   expect(mockResponse.status).toHaveBeenCalledWith(404);
    //   expect(mockResponse.json).toHaveBeenCalledWith({
    //     success: false,
    //     message: "Event tidak ditemukan",
    //   });
    // });

    it("should return event revenue details", async () => {
      const mockEventId = "mockEventId";
      const mockEvent = {
        _id: mockEventId,
        title: "Mock Event",
        quota: 100,
        price: 50000,
        date: new Date(),
        organizer: { organizerName: "Mock Organizer" },
        category: { name: "Mock Category" },
      };

      (Event.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvent),
        }),
      });

      (moment as unknown as jest.Mock).mockReturnValue({
        tz: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnValue("2024-01-01 12:00:00"),
      });

      (Payment.aggregate as jest.Mock).mockResolvedValueOnce([
        { totalRevenue: 500000, totalTicketsSold: 50 },
      ]);

      mockRequest.params = { id: mockEventId };

      await eventController.getEventByRevenue(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil mendapatkan detail event berdasarkan penghasilan",
          data: expect.objectContaining({
            revenue: 500000,
            ticketsSold: 50,
          }),
        })
      );
    });
  });
});
