import api from './api';

export const userService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/profile/student', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
