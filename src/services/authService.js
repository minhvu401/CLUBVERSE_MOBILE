import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const authService = {
  // Login - Theo đúng API của bạn
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      // Response trả về: { accessToken, user: { id, email, fullName, role } }
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register - Full payload matching API
  register: async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      // Registration doesn't return accessToken immediately - need OTP verification first
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
      });
      
      // After successful OTP verification, save tokens if provided
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', {
        email,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      throw error;
    }
  },

  // Check if logged in
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  },
};