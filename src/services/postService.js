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

  // Get posts (public feed)
  getPosts: async ({ clubId, sortBy = 'newest', limit = 20, skip = 0 } = {}) => {
    try {
      const params = {
        ...(clubId ? { clubId } : {}),
        sortBy,
        limit,
        skip,
      };
      const response = await api.get('/posts', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  likePost: async (postId) => {
    if (!postId) throw new Error('Thiếu id bài viết');
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  unlikePost: async (postId) => {
    if (!postId) throw new Error('Thiếu id bài viết');
    try {
      const response = await api.delete(`/posts/${postId}/unlike`);
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

  // Permanent delete (hard delete) a post
  permanentDeletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}/permanent`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};


