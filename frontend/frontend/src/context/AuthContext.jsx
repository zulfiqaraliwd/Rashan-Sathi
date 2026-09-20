import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start, check whether the user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('rashan_token');
        const savedUser = localStorage.getItem('rashan_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));

          // Get fresh user data from the server (to verify the session)
          try {
            const response = await authService.getMe();
            if (response.success) {
              setUser(response.user);
              localStorage.setItem('rashan_user', JSON.stringify(response.user));
            }
          } catch (error) {
            // Token is invalid — log out
            console.warn('Token invalid, logging out');
            localStorage.removeItem('rashan_token');
            localStorage.removeItem('rashan_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Signup
  const signup = async (data) => {
    const response = await authService.signup(data);
    if (response.success && response.token) {
      localStorage.setItem('rashan_token', response.token);
      localStorage.setItem('rashan_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  // Login
  const login = async (identifier, password) => {
    const response = await authService.login(identifier, password);
    if (response.success && response.token) {
      localStorage.setItem('rashan_token', response.token);
      localStorage.setItem('rashan_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    }
    return response;
  };

  // OTP verify
  const verifyOTP = async (otp) => {
    const response = await authService.verifyOTP(otp);
    if (response.success) {
      // Update the user data
      const updatedUser = { ...user, isPhoneVerified: true };
      setUser(updatedUser);
      localStorage.setItem('rashan_user', JSON.stringify(updatedUser));
    }
    return response;
  };

  // Resend OTP
  const resendOTP = async () => {
    return await authService.resendOTP();
  };

  // Profile update
  const updateProfile = async (data) => {
    const response = await authService.updateProfile(data);
    if (response.success && response.user) {
      setUser(response.user);
      localStorage.setItem('rashan_user', JSON.stringify(response.user));
    }
    return response;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('rashan_token');
    localStorage.removeItem('rashan_user');
    setToken(null);
    setUser(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isVerified: user?.isPhoneVerified || false,
    isAdmin: user?.role === 'admin',
    signup,
    login,
    logout,
    verifyOTP,
    resendOTP,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook — for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;