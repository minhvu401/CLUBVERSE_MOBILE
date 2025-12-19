import api from './api';

export const clubService = {
  // Get all clubs in the system
  getAllClubs: async () => {
    try {
      const response = await api.get('/users/clubs');
      // response: { total, clubs }
      return response;
    } catch (error) {
      throw error;
    }
  },
};


