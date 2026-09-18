const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

const sendOTP = async (phone, otp) => {
  const provider = process.env.SMS_PROVIDER || 'console';

  if (provider === 'console') {
    console.log('\n' + '='.repeat(50));
    console.log(`📱 OTP for ${phone}`);
    console.log(`🔑 Code: ${otp}`);
    console.log(`⏰ Expires in: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes`);
    console.log('='.repeat(50) + '\n');
    return { success: true, provider: 'console' };
  }

  console.warn(`⚠️ SMS provider "${provider}" not implemented. Using console.`);
  console.log(`📱 OTP for ${phone}: ${otp}`);
  return { success: true, provider: 'fallback-console' };
};

module.exports = { generateOTP, sendOTP };