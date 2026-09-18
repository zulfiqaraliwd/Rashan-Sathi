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
        message: 'Name, email, phone aur password are mandatory',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password kam az kam 6 characters ka ho',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Phone';
      return res.status(400).json({
        success: false,
        message: `${field} pehle se registered hai`,
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
      message: 'Account ban gaya! Phone verify karne ke liye OTP bheja gaya hai.',
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
        message: 'Email/phone aur password zaroori hain',
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email/phone ya password ghalat hai',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivate hai',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login kamyab!',
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

// @desc   OTP verify
// @route  POST /api/auth/verify-otp
// @access Private
const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP daalein' });
    }

    const user = await User.findById(req.user._id).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Koi OTP request nahi mili. Dobara bhejein.',
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expire ho gaya. Naya OTP bhejein.',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Ghalat OTP' });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Phone verify ho gaya! ✅',
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
      return res.status(404).json({ success: false, message: 'User nahi mila' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone pehle se verified hai',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000
    );
    await user.save();

    await sendOTP(user.phone, otp);

    res.status(200).json({ success: true, message: 'Naya OTP bhej diya gaya' });
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
      return res.status(404).json({ success: false, message: 'User nahi mila' });
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
      message: 'Profile update ho gayi ✅',
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