import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Middleware untuk menangani error dari multer
const multerErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    // Error dari Multer (misalnya: file terlalu besar)
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err.message === "Only certain file types are allowed") {
    return res.status(400).json({
      message: "File upload error: Only image files (jpeg, jpg, png) are allowed.",
    });
  }
  
  // Jika tidak ada error, lanjutkan ke middleware berikutnya
  next();
};

export default multerErrorHandler;
