const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { generateOTP, sendOTP } = require('../utils/sendOTP');

// @desc   Signup
// @route  POST /api/auth/signup
// @access Public
const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and password are mandatory',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Phone';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered`,
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
    });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000
    );
    await user.save();

    await sendOTP(phone, otp);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created! An OTP has been sent to verify your phone.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/phone and password are required',
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email/phone or password is incorrect',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        verificationBadge: user.verificationBadge,
        rating: user.rating,
        reviewCount: user.reviewCount,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Verify OTP
// @route  POST /api/auth/verify-otp
// @access Private
const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please enter OTP' });
    }

    const user = await User.findById(req.user._id).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please resend.',
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please resend a new OTP.',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone verified! ✅',
      user: {
        _id: user._id,
        name: user.name,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Resend OTP
// @route  POST /api/auth/resend-otp
// @access Private
const resendOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone is already verified',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000
    );
    await user.save();

    await sendOTP(user.phone, otp);

    res.status(200).json({ success: true, message: 'A new OTP has been sent' });
  } catch (error) {
    next(error);
  }
};

// @desc   Get me
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc   Update profile (payment methods, location, etc.)
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      address,
      location,
      profileImage,
      paymentMethods,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    if (location && location.coordinates && location.coordinates.length === 2) {
      user.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }

    if (paymentMethods) {
      user.paymentMethods = {
        jazzcash: {
          number: paymentMethods.jazzcash?.number || user.paymentMethods?.jazzcash?.number || '',
          accountName: paymentMethods.jazzcash?.accountName || user.paymentMethods?.jazzcash?.accountName || '',
          qrCodeUrl: paymentMethods.jazzcash?.qrCodeUrl || user.paymentMethods?.jazzcash?.qrCodeUrl || '',
        },
        easypaisa: {
          number: paymentMethods.easypaisa?.number || user.paymentMethods?.easypaisa?.number || '',
          accountName: paymentMethods.easypaisa?.accountName || user.paymentMethods?.easypaisa?.accountName || '',
          qrCodeUrl: paymentMethods.easypaisa?.qrCodeUrl || user.paymentMethods?.easypaisa?.qrCodeUrl || '',
        },
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated ✅',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
};