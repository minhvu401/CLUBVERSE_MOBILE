import api from './api';

export const eventService = {
  // Get all events (public list)
  getEvents: async ({ filter, clubId, limit, skip } = {}) => {
    try {
      const response = await api.get('/events', {
        params: {
          filter,
          clubId,
          limit,
          skip,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register to join an event (student)
  registerEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create a new event (for club role)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get events by clubId
  getClubEvents: async (clubId) => {
    try {
      // Updated to match your API: /events/club/:clubId
      const response = await api.get(`/events/club/${clubId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get event detail by eventId
  getEventDetail: async (eventId) => {
    try {
      // Your API: /events/:eventId
      const response = await api.get(`/events/${eventId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update event
  updateEvent: async (eventId, updateData) => {
    try {
      const response = await api.patch(`/events/${eventId}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get event participants
  getEventParticipants: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/participants`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check-in participant
  checkInParticipant: async (eventId, userId) => {
    try {
      const response = await api.post(`/events/${eventId}/check-in/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Undo check-in
  undoCheckIn: async (eventId, userId) => {
    try {
      const response = await api.delete(`/events/${eventId}/check-in/${userId}/undo`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Soft delete event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/soft`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Restore event
  restoreEvent: async (eventId) => {
    try {
      const response = await api.patch(`/events/${eventId}/restore`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Hard delete event
  hardDeleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/hard`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get deleted events
  getDeletedEvents: async (clubId) => {
    try {
      const response = await api.get(`/events/deleted?clubId=${clubId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

