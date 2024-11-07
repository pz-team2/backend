import snap from "../utils/midtranst";
import Payment from "../models/Payment";
import { Request, Response } from "express";

exports.createPayment = async (req:Request, res:Response) => {
  try {
    const { amount, method, event, quantity } = req.body;
    const user = req.user.id; // Mendapatkan user ID dari JWT

    const parameter = {
      transaction_details: {
        order_id: `order-${Math.floor(100000 + Math.random() * 900000)}`,
        gross_amount: amount,
      },
      customer_details: {
        user_id: user,
        email: 'customer@example.com',
      },
      item_details: [
        {
          id: event,
          price: amount,
          quantity: quantity,
          name: 'Tiket Event',
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);

    const payment = new Payment({
      amount,
      date: new Date(),
      method,
      user,
      event,
      quantity,
      paymentStatus: 'pending',
    });

    await payment.save();

    res.status(200).json({
      message: 'Transaksi berhasil dibuat',
      transactionToken: transaction.token,
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};
