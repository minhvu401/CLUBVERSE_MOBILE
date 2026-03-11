import api from './api';

export const notificationService = {
    /**
     * Create a new notification
     * @param {Object} data - { userId, title, message, type, metadata }
     * @returns {Promise<any>}
     */
    createNotification: async (data) => {
        return api.post('/notifications', data);
    },

    /**
     * Get all notifications for current user
     * @param {Object} params - { isRead (boolean), page (number), limit (number) }
     * @returns {Promise<any>}
     */
    getNotifications: async (params) => {
        return api.get('/notifications', { params });
    },

    /**
     * Delete all notifications for current user
     * @returns {Promise<any>}
     */
    deleteAllNotifications: async () => {
        return api.delete('/notifications');
    },

    /**
     * Get unread notification count for current user
     * @returns {Promise<any>}
     */
    getUnreadCount: async () => {
        return api.get('/notifications/unread-count');
    },

    /**
     * Get a specific notification
     * @param {string} id 
     * @returns {Promise<any>}
     */
    getNotificationById: async (id) => {
        return api.get(`/notifications/${id}`);
    },

    /**
     * Update a notification
     * @param {string} id 
     * @param {Object} data 
     * @returns {Promise<any>}
     */
    updateNotification: async (id, data) => {
        return api.patch(`/notifications/${id}`, data);
    },

    /**
     * Delete a notification
     * @param {string} id 
     * @returns {Promise<any>}
     */
    deleteNotification: async (id) => {
        return api.delete(`/notifications/${id}`);
    },

    /**
     * Mark notification as read
     * @param {string} id 
     * @returns {Promise<any>}
     */
    markAsRead: async (id) => {
        return api.patch(`/notifications/${id}/read`);
    },

    /**
     * Mark notification as unread
     * @param {string} id 
     * @returns {Promise<any>}
     */
    markAsUnread: async (id) => {
        return api.patch(`/notifications/${id}/unread`);
    },

    /**
     * Mark all notifications as read for current user
     * @returns {Promise<any>}
     */
    markAllAsRead: async () => {
        return api.patch('/notifications/read-all/mark');
    },
};
