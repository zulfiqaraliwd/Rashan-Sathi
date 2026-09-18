const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Single image
router.post('/single', protect, upload.single('image'), uploadSingle);

// Multiple images (max 5)
router.post('/multiple', protect, upload.array('images', 5), uploadMultiple);

// Delete
router.delete('/:publicId', protect, deleteImage);

module.exports = router;