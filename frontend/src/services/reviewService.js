import api from './api';

const reviewService = {
  // Review do
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Kisi user ki reviews
  getUserReviews: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
};

export default reviewService;