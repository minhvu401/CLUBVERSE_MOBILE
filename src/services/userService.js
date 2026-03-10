import { Platform } from 'react-native';
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

  // Upload or update avatar
  uploadAvatar: async (fileUri, mimeFromPicker, fileNameFromPicker) => {
    if (!fileUri) {
      throw new Error('Không có file ảnh để tải lên');
    }

    const pickedName = fileNameFromPicker || fileUri.split('/').pop() || 'avatar.jpg';
    const lower = pickedName.toLowerCase();
    const mimeType =
      mimeFromPicker ||
      (lower.endsWith('.png')
        ? 'image/png'
        : lower.endsWith('.jpg') || lower.endsWith('.jpeg')
          ? 'image/jpeg'
          : 'image/jpeg');

    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
      name: pickedName,
      type: mimeType || 'image/jpeg',
    });

    try {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      // Surface server message if available but keep response for caller
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  // Delete avatar
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/users/avatar');
      return response;
    } catch (error) {
      throw error;
    }
  },
};
