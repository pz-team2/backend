import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Organizer from '../models/Organizer';

interface DecodedToken {
  organizerId: string;
}

declare global {
  namespace Express {
    interface Request {
      organizer?: any;
    }
  }
}

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  try {
    // Periksa apakah ada token di header authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

      // Temukan user berdasarkan ID dari token
      req.organizer = await Organizer.findById(decoded.organizerId).select('-password');

      if (!req.organizer) {
        res.status(401).json({ message: 'Organizer Tidak Di tekmukan', decoded });
        return;
      }

      console.log(req.organizer)
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized, no token' });  // Kirim respons
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });  // Kirim respons
  }
};

export { protect };
