import express, { Request, Response } from 'express';
import Ticket, { ITicket } from '../models/Ticket';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const tickets: ITicket[] = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const ticket = new Ticket({
    event: req.body.event,
    price: req.body.price,
  });

  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
