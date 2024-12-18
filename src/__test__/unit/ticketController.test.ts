import { Request, Response } from "express";
import {
  getTicketsByUserId,
  getTicketByPaymentId,
  deleteAllTickets,
  getTicketsByEvent,
  updateTicketStatus,
} from "../../controllers/ticketController";
import Ticket from "../../models/Ticket";
import Event from "../../models/Event";
import apiResponse from "../../utils/apiResource";

jest.mock("../../models/Ticket");
jest.mock("../../models/Event");

describe("Ticket Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: {},
      user: { _id: "user123" },
    } as Partial<Request>;
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTicketsByUserId", () => {
    it("should return tickets for the user if found", async () => {
      const mockTickets = [
        {
          payment: {
            user: "user123",
            event: {
              title: "Event A",
              date: "2023-12-25",
              address: "Somewhere",
              description: "A great event",
              status: "active",
              startTime: "10:00",
              finishTime: "14:00",
              picture: "image.jpg",
            },
            user1: {
              fullname: "User Name",
              email: "user@example.com",
              username: "username",
            },
          },
        },
      ];

      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue(mockTickets),
        }),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Tickets retrieved successfully", mockTickets, 200)
      );
    });

    it("should return 404 if no tickets found", async () => {
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue([]),
        }),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Tickets not found", null, 404)
      );
    });

    it("should return 500 if an error occurs", async () => {
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          then: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error fetching tickets", expect.any(Error), 500)
      );
    });
  });

  describe("getTicketByPaymentId", () => {
    it("should return the ticket if found", async () => {
      const mockTicket = [
        {
          payment: {
            _id: "payment123",
            event: {
              _id: "event123",
              title: "Event A",
              date: "2023-12-25",
              address: "Somewhere",
              description: "A great event",
              status: "active",
              startTime: "10:00",
              finishTime: "14:00",
              picture: "image.jpg",
            },
            user: {
              _id: "user123",
              fullname: "User Name",
              email: "user@example.com",
              username: "username",
            },
          },
        },
      ];

      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTicket),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Ticket found", mockTicket, 200)
      );
    });

    it("should return 404 if no ticket is found", async () => {
      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Ticket not found", null, 404)
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error fetching ticket", expect.any(Error), 500)
      );
    });
  });

  describe("deleteAllTickets", () => {
    it("should delete all tickets and return success message", async () => {
      (Ticket.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 10 });

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "All tickets successfully deleted", 200)
      );
    });

    it("should return 400 if no tickets found to delete", async () => {
      (Ticket.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "No tickets found to delete", null, 400)
      );
    });

    it("should return 500 if an error occurs", async () => {
      (Ticket.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error deleting tickets", expect.any(Error), 500)
      );
    });
  });

  describe("getTicketsByEvent", () => {
    it("should return tickets for an existing event", async () => {
      const mockEvent = { _id: "event123" };
      const mockTickets = [
        {
          payment: {
            event: "event123",
            user: {
              fullName: "User Name",
              email: "user@example.com",
            },
          },
        },
      ];

      req.params = { eventId: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTickets),
      });

      await getTicketsByEvent(req as Request, res as Response);

      expect(Event.findById).toHaveBeenCalledWith("event123");
      expect(Ticket.find).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Data tiket berhasil diambil",
          { tickets: mockTickets },
          200
        )
      );
    });

    it("should return 404 if event does not exist", async () => {
      req.params = { eventId: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      await getTicketsByEvent(req as Request, res as Response);

      expect(Event.findById).toHaveBeenCalledWith("event123");
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Event tidak ditemukan", null, 404)
      );
    });

    it("should return 404 if no tickets found for the event", async () => {
      const mockEvent = { _id: "event123" };

      req.params = { eventId: "event123" };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await getTicketsByEvent(req as Request, res as Response);

      expect(Event.findById).toHaveBeenCalledWith("event123");
      expect(Ticket.find).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Data tiket tidak tersedia", null, 404)
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { eventId: "event123" };

      (Event.findById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await getTicketsByEvent(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Gagal mengambil data tiket", expect.any(Error), 500)
      );
    });
  });

  describe("updateTicketStatus", () => {
    it("should update ticket status to 'USED'", async () => {
      const mockTicket = {
        _id: "ticket123",
        status: "ACTIVE",
        save: jest.fn().mockResolvedValue(true),
      };

      req.params = { ticketId: "ticket123" };

      (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);

      await updateTicketStatus(req as Request, res as Response);

      expect(Ticket.findById).toHaveBeenCalledWith("ticket123");
      expect(mockTicket.status).toBe("USED");
      expect(mockTicket.save).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(
          true,
          "Status Ticket Berhasil Di perbaharui ",
          mockTicket,
          200
        )
      );
    });

    it("should return 500 if ticket is not found", async () => {
      req.params = { ticketId: "ticket123" };

      (Ticket.findById as jest.Mock).mockResolvedValue(null);

      await updateTicketStatus(req as Request, res as Response);

      expect(Ticket.findById).toHaveBeenCalledWith("ticket123");
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Tiket tidak ditemukan", null, 500)
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { ticketId: "ticket123" };

      (Ticket.findById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await updateTicketStatus(req as Request, res as Response);

      expect(Ticket.findById).toHaveBeenCalledWith("ticket123");
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(
          false,
          "Gagal mengupdate status tiket",
          expect.any(Error),
          500
        )
      );
    });
  });
});
