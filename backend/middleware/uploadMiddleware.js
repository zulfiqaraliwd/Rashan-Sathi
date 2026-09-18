const multer = require('multer');

// Memory storage — Cloudinary pe directly bhejenge
const storage = multer.memoryStorage();

// File filter — sirf images allow
const fileFilter = (req, file, cb) => {
  const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sirf JPG, PNG ya WEBP images allow hain'), false);
  }
};

// Multer setup
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024, // 5MB default
  },
  fileFilter,
});

module.exports = upload;