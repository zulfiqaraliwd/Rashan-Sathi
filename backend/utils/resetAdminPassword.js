const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

/**
 * Reset the admin's email and/or password
 *
 * Usage:
 *   npm run reset-admin -- --password=NewPass123
 *   npm run reset-admin -- --email=new@email.com
 *   npm run reset-admin -- --email=new@email.com --password=NewPass123
 *   npm run reset-admin -- --phone=03001234567
 */
const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Parse args
    const args = process.argv.slice(2);
    const getArg = (name) => {
      const arg = args.find((a) => a.startsWith(`--${name}=`));
      return arg ? arg.split('=')[1] : null;
    };

    const newPassword = getArg('password');
    const newEmail = getArg('email');
    const newPhone = getArg('phone');

    if (!newPassword && !newEmail && !newPhone) {
      console.error('\n❌ Nothing to do! Examples:');
      console.error('   npm run reset-admin -- --password=NewPass123');
      console.error('   npm run reset-admin -- --email=new@email.com');
      console.error('   npm run reset-admin -- --email=new@email.com --password=NewPass123');
      console.error('   npm run reset-admin -- --phone=03001234567\n');
      process.exit(1);
    }

    // Find admin by current email
    const currentEmail = process.env.ADMIN_EMAIL || 'admin@rashansathi.pk';
    const admin = await User.findOne({ email: currentEmail }).select('+password');

    if (!admin) {
      console.error('❌ Admin not found:', currentEmail);
      process.exit(1);
    }

    if (admin.role !== 'admin') {
      console.error('⚠️ This user is not an admin. Role:', admin.role);
      process.exit(1);
    }

    // Email change
    if (newEmail) {
      const existing = await User.findOne({
        email: newEmail.toLowerCase(),
        _id: { $ne: admin._id },
      });

      if (existing) {
        console.error('❌ This email already belongs to another user:', newEmail);
        process.exit(1);
      }

      const oldEmail = admin.email;
      admin.email = newEmail.toLowerCase();
      console.log('📧 Email change:', oldEmail, '→', newEmail);
    }

    // Phone change
    if (newPhone) {
      const existing = await User.findOne({
        phone: newPhone,
        _id: { $ne: admin._id },
      });

      if (existing) {
        console.error('❌ This phone already belongs to another user:', newPhone);
        process.exit(1);
      }

      const oldPhone = admin.phone;
      admin.phone = newPhone;
      console.log('📱 Phone change:', oldPhone, '→', newPhone);
    }

    // Password change
    if (newPassword) {
      if (newPassword.length < 6) {
        console.error('❌ Password must be at least 6 characters');
        process.exit(1);
      }
      admin.password = newPassword;
      console.log('🔑 Password changed');
    }

    await admin.save();

    console.log('\n' + '='.repeat(50));
    console.log('Admin updated!');
    console.log('='.repeat(50));
    console.log('Email:    ', admin.email);
    console.log('📱 Phone:    ', admin.phone);
    if (newPassword) {
      console.log('Password: ', newPassword);
    } else {
      console.log('Password:  (unchanged)');
    }
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();