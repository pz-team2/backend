import express, { Request, Response } from 'express';
import Payment, { IPayment } from '../models/Payment';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const payments: IPayment[] = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const payment = new Payment({
    amount: req.body.amount,
    method: req.body.method,
  });

  try {
    const newPayment = await payment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
