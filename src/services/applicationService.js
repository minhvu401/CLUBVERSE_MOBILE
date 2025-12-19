import api from './api';

export const applicationService = {
  // Create application to join a club (for student role)
  createApplication: async (clubId, reason) => {
    try {
      const response = await api.post('/applications', { clubId, reason });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's applications
  getMyApplications: async () => {
    try {
      const response = await api.get('/applications/my-applications');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel/Delete application
  cancelApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/applications/${applicationId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get club's applications (for club role)
  getClubApplications: async (clubId) => {
    try {
      const response = await api.get(`/applications/club/${clubId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Approve application (for club role)
  approveApplication: async (applicationId, interviewData) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/approve`, interviewData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject application (for club role)
  rejectApplication: async (applicationId, rejectionReason) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/reject`, {
        rejectionReason: rejectionReason || 'Đơn không phù hợp với yêu cầu của câu lạc bộ',
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Final decision after interview (for club role)
  finalDecision: async (applicationId, decision, rejectionReason) => {
    try {
      const payload = { decision };
      if (decision === 'declined' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      const response = await api.patch(`/applications/${applicationId}/final-decision`, payload);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

