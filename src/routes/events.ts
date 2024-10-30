import express, { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events: IEvent[] = await Event.find().populate('organizer');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const event = new Event({
    title: req.body.title,
    date: req.body.date,
    organizer: req.body.organizer,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
