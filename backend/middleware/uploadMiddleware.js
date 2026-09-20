const multer = require('multer');

// Memory storage — we'll send directly to Cloudinary
const storage = multer.memoryStorage();

// File filter — allow only images
const fileFilter = (req, file, cb) => {
  const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG or WEBP images are allowed'), false);
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