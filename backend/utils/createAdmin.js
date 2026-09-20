const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const email = process.env.ADMIN_EMAIL || 'admin@rashansathi.pk';
    const phone = process.env.ADMIN_PHONE || '03001234567';
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Check if admin already exists
    const existing = await User.findOne({ $or: [{ email }, { phone }] });

    if (existing) {
      if (existing.role === 'admin') {
        console.log('⚠️ Admin already exists:', existing.email);
        process.exit(0);
      }
      // Make the existing user an admin
      existing.role = 'admin';
      existing.isPhoneVerified = true;
      existing.isEmailVerified = true;
      existing.verificationBadge = 'verified';
      await existing.save();
      console.log('✅ Existing user promoted to admin:', existing.email);
      process.exit(0);
    }

    // Create a new admin
    const admin = await User.create({
      name: 'Admin',
      email,
      phone,
      password,
      role: 'admin',
      isPhoneVerified: true,
      isEmailVerified: true,
      verificationBadge: 'verified',
    });

    console.log('\n' + '='.repeat(50));
    console.log('Admin created!');
    console.log('='.repeat(50));
    console.log('Email:    ', email);
    console.log(' Phone:    ', phone);
    console.log(' Password: ', password);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

createAdmin();