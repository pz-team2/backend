// src/routes/organizers.ts
import express, { Request, Response, Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import Organizer, { IOrganizer } from '../models/Organizer';

const router: Router = express.Router();

interface TypedRequest<T> extends Request {
  body: T
}

interface CreateOrganizerRequest {
  name: string;
}

// Get all organizers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const organizers = await Organizer.find();
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
});

// Create organizer
router.post('/', async (req: TypedRequest<CreateOrganizerRequest>, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const organizer = new Organizer({ name });
    const newOrganizer = await organizer.save();
    
    res.status(201).json(newOrganizer);
  } catch (error) {
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
});

// Get organizer by ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) {
      res.status(404).json({ message: 'Organizer not found' });
      return;
    }
    res.json(organizer);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
});

// Update organizer
router.put('/:id', async (req: TypedRequest<CreateOrganizerRequest> & { params: { id: string } }, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!organizer) {
      res.status(404).json({ message: 'Organizer not found' });
      return;
    }

    res.json(organizer);
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
});

// Delete organizer
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const organizer = await Organizer.findByIdAndDelete(req.params.id);
    
    if (!organizer) {
      res.status(404).json({ message: 'Organizer not found' });
      return;
    }

    res.json({ message: 'Organizer deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'An error occurred' 
    });
  }
});

export default router;