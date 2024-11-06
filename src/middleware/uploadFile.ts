import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/', // Pastikan folder ini ada dan dapat diakses
    filename: (req, file, cb) => {
      // Nama file yang di-upload menggunakan timestamp untuk menghindari duplikasi
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 1000000 }, // Batasi ukuran file 1MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // Format gambar yang diterima
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); // File valid
    } else {
      cb(new Error('Hanya gambar dengan format jpeg, jpg, png, atau gif yang diperbolehkan.'));
    }
  }
});

export default upload;
