import multer from 'multer';
import path from 'path';

// Setup multer storage and file size limits
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads', // Make sure this folder exists and is accessible
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 1000000 }, // Limit file size to 1MB (1MB = 1,000,000 bytes)
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // Allowed image formats
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); // Valid file
    } else {
      cb(new Error('Hanya gambar dengan format jpeg, jpg, png, atau gif yang diperbolehkan.'));
    }
  }
});

upload.single('image');

const handleError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimum 1MB.',
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Terjadi kesalahan saat mengunggah file.',
    });
  }

  next();
};

export { upload, handleError };
