import api from './api';

const authService = {
  // Signup
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Login
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    return response.data;
  },

  // OTP verify
  verifyOTP: async (otp) => {
    const response = await api.post('/auth/verify-otp', { otp });
    return response.data;
  },

  // OTP resend
  resendOTP: async () => {
    const response = await api.post('/auth/resend-otp');
    return response.data;
  },

  // Current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Profile update
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export default authService;