import { Request, Response } from "express";
import mongoose from "mongoose";
import Event from "../../models/Event";
import Payment from "../../models/Payment";
import apiResponse from "../../utils/apiResource";
import * as eventController from "../../controllers/eventController";

jest.mock("../../models/Event");
jest.mock("../../models/Payment");
jest.mock("../../utils/apiResource", () => jest.fn());

describe("Event Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

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

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "File gambar diperlukan!",
        })
      );
    });

    it("should save event if valid", async () => {
      mockRequest.params = { id: "organizerId" };
      mockRequest.file = { path: "/path/to/image", size: 500 * 1024 } as any;
      mockRequest.body = {
        title: "Test Event",
        quota: 100,
        price: 50000,
        startTime: "10:00",
        finishTime: "12:00",
        address: "Test Address",
        status: "active",
        description: "Test Description",
        category: new mongoose.Types.ObjectId(),
      };

      (Event.prototype.save as jest.Mock).mockResolvedValue({
        _id: "mockEventId",
        ...mockRequest.body,
        picture: "/path/to/image",
      });

      await eventController.tambahEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Berhasil Menambahkan Data",
        })
      );
    });
  });

  describe("getEvent", () => {
    it("should return all events", async () => {
      const mockEvents = [
        { title: "Event 1", date: "2024-01-01" },
        { title: "Event 2", date: "2024-02-01" },
      ];

      (Event.find as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvents),
        }),
      });

      await eventController.getEvent(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Event berhasil diambil",
          data: mockEvents,
        })
      );
    });
  });

  describe("getEventById", () => {
    it("should return an event by ID", async () => {
      const mockEvent = { _id: "eventId", title: "Event Test" };

      (Event.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvent),
        }),
      });

      mockRequest.params = { id: "eventId" };

      await eventController.getEventById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Event berhasil diakses",
          data: mockEvent,
        })
      );
    });
  });

  describe("getRecentEvents", () => {
    it("should return recent events", async () => {
      const mockEvents = [
        { title: "Recent Event 1", date: "2024-01-01" },
        { title: "Recent Event 2", date: "2024-02-01" },
      ];

      (Event.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockEvents),
      });

      try {
        await eventController.getRecentEvents(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: "Berhasil mendapatkan event terbaru",
            data: {
              data: mockEvents,
              pagination: expect.any(Object),
            },
          })
        );
      } catch (error) {
        console.error("Error in getRecentEvents test:", error);
        throw error;
      }
    });
  });

  describe("getDataEventOrganizer", () => {
    it("should return event data by organizer", async () => {
      const mockEvents = [
        {
          _id: "eventId",
          title: "Test Event",
          date: new Date(),
          picture: "/path/to/image",
          organizer: { _id: "organizerId", organizerName: "Organizer Name" },
          status: "active",
        },
      ];

      const mockPayments = [{ total: 10 }];

      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      (Payment.aggregate as jest.Mock).mockResolvedValue(mockPayments);

      mockRequest.params = { organizerId: "organizerId" };

      try {
        await eventController.getDataEventOrganizer(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: "Berhasil mendapatkan event terbaru",
            data: [
              expect.objectContaining({
                id: mockEvents[0]._id,
                title: mockEvents[0].title,
                ticketsSold: 10,
              }),
            ],
          })
        );
      } catch (error) {
        console.error("Error in getDataEventOrganizer test:", error);
        throw error;
      }
    });
  });

  describe("getEventsByOrganizer", () => {
    it("should return events by organizer", async () => {
      const mockEvents = [
        { title: "Event 1", date: "2024-01-01", organizer: "organizerId" },
        { title: "Event 2", date: "2024-02-01", organizer: "organizerId" },
      ];

      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      mockRequest.params = { organizerId: "organizerId" };
      mockRequest.query = { page: "1", limit: "2" };

      try {
        await eventController.getEventsByOrganizer(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            message: "Berhasil mendapatkan event organizer",
            data: {
              data: mockEvents,
              pagination: expect.any(Object),
            },
          })
        );
      } catch (error) {
        console.error("Error in getEventsByOrganizer test:", error);
        throw error;
      }
    });
  });

  describe("getEventStats", () => {
    it("should return event stats successfully", async () => {
      const mockEventId = "mockEventId";
      const mockEvent = {
        _id: mockEventId,
        title: "Mock Event",
        quota: 100,
        date: new Date(),
        organizer: { organizerName: "Mock Organizer" },
        category: { name: "Mock Category" },
      };

      (Event.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvent),
        }),
      });

      (Payment.aggregate as jest.Mock).mockResolvedValueOnce([
        { totalRevenue: 500000 },
      ]);
      (Payment.aggregate as jest.Mock).mockResolvedValueOnce([{ total: 50 }]); // Tickets sold

      mockRequest.params = { id: mockEventId };

      await eventController.getEventStats(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
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
    it("should return event revenue details", async () => {
      const mockEventId = "mockEventId";
      const mockEvent = {
        _id: mockEventId,
        title: "Mock Event",
        quota: 100,
        price: 50000,
        organizer: { organizerName: "Mock Organizer" },
        category: { name: "Mock Category" },
      };

      (Event.findById as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest.fn().mockResolvedValueOnce(mockEvent),
        }),
      });

      (Payment.aggregate as jest.Mock).mockResolvedValueOnce([
        { totalRevenue: 500000, totalTicketsSold: 50 },
      ]);

      mockRequest.params = { id: mockEventId };

      await eventController.getEventByRevenue(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
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
