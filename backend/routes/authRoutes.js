const express = require('express');
const router = express.Router();
const {
  signup, login, verifyOTP, resendOTP, getMe, updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', protect, verifyOTP);
router.post('/resend-otp', protect, resendOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;