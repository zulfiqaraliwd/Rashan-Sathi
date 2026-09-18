export const APP_NAME = 'Rashan Sathi';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  POST_TRIP: '/post-trip',
  TRIP_DETAILS: '/trip/:id',
  MY_TRIPS: '/my-trips',
  CREATE_REQUEST: '/request/:tripId',
  MY_REQUESTS: '/my-requests',
  REQUEST_DETAILS: '/request-details/:id',
  CHAT: '/chat/:requestId',
  PAYMENT: '/payment/:requestId',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  ORDER_HISTORY: '/orders',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_TRANSACTIONS: '/admin/transactions',
};

export const LANGUAGES = {
  UR: 'ur',
  EN: 'en',
};

export const STORAGE_KEYS = {
  TOKEN: 'rashan_token',
  USER: 'rashan_user',
  LANGUAGE: 'rashan_language',
};