import api from './api';

export const postService = {
  // Create a new post for current club (clubId comes from access token on backend)
  createPost: async ({ title, tags, content, images }) => {
    try {
      const response = await api.post('/posts', {
        title,
        tags,
        content,
        images,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get posts of a specific club (for club role)
  getClubPosts: async (clubId) => {
    try {
      const response = await api.get(`/posts/club/${clubId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (postId, data) => {
    try {
      const response = await api.patch(`/posts/${postId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all deleted posts
  getDeletedPosts: async () => {
    try {
      const response = await api.get('/posts/deleted');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Restore a deleted post
  restorePost: async (postId) => {
    try {
      const response = await api.patch(`/posts/${postId}/restore`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};


