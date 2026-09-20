import api from './api';

const reviewService = {
  // Submit a review
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // A user's reviews
  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
};

export default reviewService;