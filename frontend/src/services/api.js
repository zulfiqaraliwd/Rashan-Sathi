import axios from 'axios';

// Axios instance banao
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor — har request mein token add karo
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

// Response interceptor — errors handle karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar 401 (unauthorized) aaye to logout kar do
    if (error.response?.status === 401) {
      localStorage.removeItem('rashan_token');
      localStorage.removeItem('rashan_user');
      
      // Agar login page pe nahi ho to redirect karo
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;