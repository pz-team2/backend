import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  payment,
  getOrganizerPaymentReport,
  midtransNotification,
  deleteAllPayments,
  getUserTransactionHistory,
} from "../../controllers/paymentController";
import Event from "../../models/Event";
import Payment from "../../models/Payment";
import Ticket from "../../models/Ticket";
import apiResponse from "../../utils/apiResource";
import snap from "../../utils/midtranst";
import QRCode from "qrcode";

jest.mock("../../models/Event");
jest.mock("../../models/Payment");
jest.mock("../../models/Ticket");
jest.mock("../../utils/apiResource");
jest.mock("../../utils/midtranst");
jest.mock("qrcode");

describe("Payment Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      params: {},
      body: {},
      user: { _id: new mongoose.Types.ObjectId(), email: "test@example.com" },
      organizer: { _id: new mongoose.Types.ObjectId() },
    };
    mockRes = {
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe("payment", () => {
    it("should create payment and return midtrans token", async () => {
      const mockEvent = {
        _id: new mongoose.Types.ObjectId(),
        title: "Test Event",
        price: 100,
        quota: 50,
      };

      mockReq.params = { id: mockEvent._id.toString() };
      mockReq.body = { quantity: 2 };

      (Event.findById as jest.Mock).mockResolvedValue(mockEvent);
      (Payment.prototype.save as jest.Mock).mockResolvedValue({});
      (snap.createTransaction as jest.Mock).mockResolvedValue({
        token: "test-token",
        redirect_url: "https://test.com/payment",
      });

      await payment(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mendapatkan token pembayaran",
        expect.objectContaining({
          paymentToken: "test-token",
          redirectUrl: "https://test.com/payment",
        })
      );
    });

    it("should return error if event not found", async () => {
      mockReq.params = { id: "nonexistent-id" };

      (Event.findById as jest.Mock).mockResolvedValue(null);

      await payment(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Event Tidak Ditemukan",
        null
      );
    });
  });

  describe("getOrganizerPaymentReport", () => {
    it("should return payment report for organizer", async () => {
      const mockEvents = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Event 1",
          date: new Date(),
        },
      ];

      const mockMonthlySales = [
        {
          _id: { year: 2023, month: 1 },
          ticketsSold: 10,
        },
      ];

      const mockReport = [
        {
          totalPayment: 1000,
          totalTransactions: 5,
          totalTicketsSold: 10,
        },
      ];

      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockEvents),
        }),
      });

      (Payment.aggregate as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(mockMonthlySales))
        .mockImplementationOnce(() => Promise.resolve(mockReport));

      await getOrganizerPaymentReport(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mendapatkan laporan",
        expect.objectContaining({
          totalPayment: 1000,
          totalTransactions: 5,
          totalTicketsSold: 10,
        })
      );
    });

    it("should return error if no events found", async () => {
      (Event.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue([]),
        }),
      });

      await getOrganizerPaymentReport(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Tidak ada event ditemukan untuk organizer ini"
      );
    });
  });

  describe("midtransNotification", () => {
    it("should process successful payment", async () => {
      const mockEventId = new mongoose.Types.ObjectId();
      const mockPaymentId = new mongoose.Types.ObjectId();

      const mockEvent = {
        _id: mockEventId,
        quota: 10,
        findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      };

      const mockPayment = {
        _id: mockPaymentId,
        event: { _id: mockEventId },
        quantity: 2,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue({}),
      };

      mockReq.body = {
        status_code: "200",
        order_id: "test-order",
      };

      (Payment.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayment),
      });
      (Event.findOne as jest.Mock).mockResolvedValue(mockEvent);
      (Event.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockEvent);

      (QRCode.toDataURL as jest.Mock).mockResolvedValue("test-qr-code");
      (Ticket.prototype.save as jest.Mock).mockResolvedValue({});

      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Status pembayaran berhasil diperbarui dan tiket dibuat",
        data: {
          payment: mockPayment,
          tickets: expect.any(Array),
        },
        code: 200,
      });

      await midtransNotification(mockReq as Request, mockRes as Response);

      expect(Payment.findOne).toHaveBeenCalledWith({ order_id: "test-order" });
      expect(Event.findOne).toHaveBeenCalledWith({ _id: mockEventId });
      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEventId,
        { quota: 8 },
        { new: true }
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Status pembayaran berhasil diperbarui dan tiket dibuat",
        expect.objectContaining({
          payment: expect.any(Object),
          tickets: expect.any(Array),
        }),
        200
      );
    });

    it("should handle pending payment status", async () => {
      const mockEventId = new mongoose.Types.ObjectId();
      const mockPaymentId = new mongoose.Types.ObjectId();

      const mockPayment = {
        _id: mockPaymentId,
        event: { _id: mockEventId },
        quantity: 2,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue({}),
      };

      mockReq.body = {
        status_code: "201",
        order_id: "test-order",
      };

      (Payment.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayment),
      });
      (Event.findOne as jest.Mock).mockResolvedValue({
        _id: mockEventId,
        quota: 10,
      });

      (apiResponse as jest.Mock).mockReturnValue({
        success: true,
        message: "Status pembayaran berhasil diperbarui",
        data: mockPayment,
      });

      await midtransNotification(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Status pembayaran berhasil diperbarui",
        mockPayment
      );
      expect(mockPayment.paymentStatus).toBe("pending");
    });

    it("should handle payment failure", async () => {
      const mockEventId = new mongoose.Types.ObjectId();
      const mockPaymentId = new mongoose.Types.ObjectId();

      const mockPayment = {
        _id: mockPaymentId,
        event: { _id: mockEventId },
        quantity: 2,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue({}),
      };

      mockReq.body = {
        status_code: "400",
        order_id: "test-order",
      };

      (Payment.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayment),
      });
      (Event.findOne as jest.Mock).mockResolvedValue({
        _id: mockEventId,
        quota: 10,
      });

      (apiResponse as jest.Mock).mockReturnValue({
        success: false,
        message: "Pembayaran gagal",
        data: null,
        code: 400,
      });

      await midtransNotification(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Pembayaran gagal",
        null,
        400
      );
    });

    it("should handle event not found", async () => {
      const mockPaymentId = new mongoose.Types.ObjectId();

      const mockPayment = {
        _id: mockPaymentId,
        event: { _id: new mongoose.Types.ObjectId() },
        quantity: 2,
        paymentStatus: "pending",
      };

      mockReq.body = {
        status_code: "200",
        order_id: "test-order",
      };

      (Payment.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayment),
      });
      (Event.findOne as jest.Mock).mockResolvedValue(null);

      await midtransNotification(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Event tidak ditemukan",
        null,
        404
      );
    });

    it("should handle insufficient ticket quota", async () => {
      const mockEventId = new mongoose.Types.ObjectId();
      const mockPaymentId = new mongoose.Types.ObjectId();

      const mockEvent = {
        _id: mockEventId,
        quota: 1,
        findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      };

      const mockPayment = {
        _id: mockPaymentId,
        event: { _id: mockEventId },
        quantity: 2,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue({}),
      };

      mockReq.body = {
        status_code: "200",
        order_id: "test-order",
      };

      (Payment.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPayment),
      });
      (Event.findOne as jest.Mock).mockResolvedValue(mockEvent);

      await midtransNotification(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Kuota tiket tidak mencukupi",
        null,
        400
      );
    });
  });

  describe("deleteAllPayments", () => {
    it("should delete all payments", async () => {
      (Payment.deleteMany as jest.Mock).mockResolvedValue({
        deletedCount: 5,
      });

      await deleteAllPayments(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "All payments successfully deleted"
      );
    });

    it("should return error if no payments found", async () => {
      (Payment.deleteMany as jest.Mock).mockResolvedValue({
        deletedCount: 0,
      });

      await deleteAllPayments(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "No payments found to delete",
        404
      );
    });
  });

  describe("getUserTransactionHistory", () => {
    it("should get user transaction history successfully", async () => {
      const mockTransactions = [
        {
          _id: new mongoose.Types.ObjectId(),
          event: {
            title: "Event 1",
            date: new Date(),
            address: "Test Address",
          },
          amount: 100,
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          event: {
            title: "Event 2",
            date: new Date(),
            address: "Another Address",
          },
          amount: 200,
          createdAt: new Date(),
        },
      ];

      (Payment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockTransactions),
        }),
      });

      await getUserTransactionHistory(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(apiResponse).toHaveBeenCalledWith(
        true,
        "Berhasil mendapatkan histori transaksi",
        mockTransactions
      );
    });

    it("should return error if no transactions found", async () => {
      (Payment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      });

      await getUserTransactionHistory(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Tidak ada transaksi ditemukan"
      );
    });

    it("should handle error during transaction history retrieval", async () => {
      (Payment.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database connection error");
      });

      await getUserTransactionHistory(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(apiResponse).toHaveBeenCalledWith(
        false,
        "Gagal mendapatkan histori transaksi",
        expect.any(Error)
      );
    });
  });
});
