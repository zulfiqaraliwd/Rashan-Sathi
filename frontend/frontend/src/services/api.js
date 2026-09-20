import axios from 'axios';

// Create the Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor — add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rashan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 (unauthorized), log the user out
    if (error.response?.status === 401) {
      localStorage.removeItem('rashan_token');
      localStorage.removeItem('rashan_user');
      
      // Redirect unless we are already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;