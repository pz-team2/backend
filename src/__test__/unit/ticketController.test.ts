import { Request, Response } from "express";
import {
  getTicketsByUserId,
  getTicketByPaymentId,
  deleteAllTickets,
} from "../../controllers/ticketController";
import Ticket from "../../models/Ticket";
import apiResponse from "../../utils/apiResource";

jest.mock("../../models/Ticket");

describe("Ticket Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = { params: {}, user: { _id: "user123" } } as Partial<Request>;
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
          _id: "ticket123",
          payment: {
            event: { title: "Event A" },
            user: { fullname: "User 1" },
          },
        },
      ];

      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTickets),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Tickets retrieved successfully", mockTickets)
      );
    });

    it("should return 404 if no tickets found", async () => {
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Tickets not found")
      );
    });

    it("should return 500 if an error occurs", async () => {
      (Ticket.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await getTicketsByUserId(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error fetching tickets", expect.any(Error))
      );
    });
  });

  describe("getTicketByPaymentId", () => {
    it("should return the ticket if found", async () => {
      const mockTicket = [
        {
          _id: "ticket123",
          name: "VIP Ticket",
          code: "TICK123",
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
          qrcode: "qrcode123",
          status: "active",
        },
      ];

      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockTicket),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "Ticket found", mockTicket)
      );
    });

    it("should return 404 if no ticket is found", async () => {
      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Ticket not found")
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.params = { id: "payment123" };

      (Ticket.find as jest.Mock).mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await getTicketByPaymentId(req as Request, res as Response);

      expect(Ticket.find).toHaveBeenCalledWith({ payment: "payment123" });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error fetching ticket", expect.any(Error))
      );
    });
  });

  describe("deleteAllTickets", () => {
    it("should delete all tickets and return success message", async () => {
      (Ticket.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 10 });

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(true, "All tickets successfully deleted")
      );
    });

    it("should return 404 if no tickets found to delete", async () => {
      (Ticket.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "No tickets found to delete")
      );
    });

    it("should return 500 if an error occurs", async () => {
      (Ticket.deleteMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await deleteAllTickets(req as Request, res as Response);

      expect(Ticket.deleteMany).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        apiResponse(false, "Error deleting tickets", expect.any(Error))
      );
    });
  });
});