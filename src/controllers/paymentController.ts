import { Request, Response } from "express";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";
import Payment from "../models/Payment";
import snap from "../utils/midtranst";

export const payment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await Event.findById(id);
    
    if (!event) {
        return res.status(404).json(apiResponse(false, 'Event Tidak Ditemukan', null));
    }
    
    try {
        const { quantity } = req.body;
        const amount = event.price * quantity;
        const order_id = `order-${Date.now()}`

        const newPayment = new Payment({
            user: req.user._id,
            event: event._id,
            amount: amount,
            quantity,
            order_id: order_id,
            paymentStatus: 'pending',
        });
        await newPayment.save();

        const transactionParams = {
            transaction_details: {
                order_id: order_id,
                gross_amount: amount,
            },
            item_details: [{
                id: event._id,
                price: Math.round(event.price),
                quantity: quantity,
                name: event.title,
            }],
            customer_details: {
                user_id: req.user._id,
                email: req.user.email,
            },
            "callback_url": process.env.CALLBACK_MIDTRANS
        };

        const midtransResponse = await snap.createTransaction(transactionParams);

        res.status(200).json(apiResponse(true, 'Berhasil mendapatkan token pembayaran', {
            paymentToken: midtransResponse.token,
            redirectUrl: midtransResponse.redirect_url,
        }));
        
    } catch (error) {
        res.status(500).json(apiResponse(false, 'Terjadi kesalahan', error));
    }
};

export const midtransNotification = async (req: Request, res: Response) => {
    const notification = req.body;

    try {

        const transactionStatus = notification.status_code;
        const orderId = notification.order_id;

        // // Cari pembayaran berdasarkan order ID
        const payment = await Payment.findOne({ order_id: orderId });   

        if (!payment) {
            return res.status(404).json(apiResponse(false, "Pembayaran tidak ditemukan", null));
        }

        // // Perbarui status pembayaran berdasarkan status transaksi dari Midtrans
        if (transactionStatus == 200 ) {
            payment.paymentStatus = 'paid';
        } else if (transactionStatus == 201) {
            payment.paymentStatus = 'pending';
        }else{
            return 'pembayaran gagal'
        }

        const data = await payment.save();
        // console.log(data)

        res.status(200).json(apiResponse(true, "Status pembayaran berhasil diperbarui", payment));
    } catch (error) {
        res.status(500).json(apiResponse(false, "Terjadi kesalahan saat memproses notifikasi", error));
    }
};
