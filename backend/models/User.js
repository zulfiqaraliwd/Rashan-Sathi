const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name zaroori hai'],
      trim: true,
      maxlength: [50, 'Name 50 characters se zyada nahi ho sakta'],
    },
    email: {
      type: String,
      required: [true, 'Email zaroori hai'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email daalein'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number zaroori hai'],
      unique: true,
      match: [/^(\+92|0)?3[0-9]{9}$/, 'Valid Pakistani number daalein (e.g. 03001234567)'],
    },
    password: {
      type: String,
      required: [true, 'Password zaroori hai'],
      minlength: [6, 'Password kam az kam 6 characters'],
      select: false, // queries mein by default nahi aayega
    },

    // Verification
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },

    // Profile
    profileImage: { type: String, default: '' },
    bio: { type: String, maxlength: 200, default: '' },

    // Verification badge (CNIC ya student card etc.)
    verificationBadge: {
      type: String,
      enum: ['none', 'pending', 'verified'],
      default: 'none',
    },

    // Rating (average + count)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Location (last known)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    address: { type: String, default: '' },

    // Role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Stats
    totalTripsPosted: { type: Number, default: 0 },
    totalRequestsMade: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }, // PKR
    totalSpent: { type: Number, default: 0 }, // PKR

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Geospatial index for nearby search
userSchema.index({ location: '2dsphere' });


// Password hash karne se pehle
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// Password compare method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);