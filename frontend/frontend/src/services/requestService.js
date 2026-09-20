import api from './api';

const requestService = {
  // Create a new request
  createRequest: async (data) => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  // My requests
  getMyRequests: async () => {
    const response = await api.get('/requests/my');
    return response.data;
  },

  // Requests for a trip (for the shopper)
  getRequestsForTrip: async (tripId) => {
    const response = await api.get(`/requests/trip/${tripId}`);
    return response.data;
  },

  // A single request
  getRequestById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Accept
  acceptRequest: async (id) => {
    const response = await api.put(`/requests/${id}/accept`);
    return response.data;
  },

  // Reject
  rejectRequest: async (id, reason) => {
    const response = await api.put(`/requests/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel
  cancelRequest: async (id, reason) => {
    const response = await api.put(`/requests/${id}/cancel`, { reason });
    return response.data;
  },

  // Start shopping
  startShopping: async (id) => {
    const response = await api.put(`/requests/${id}/start-shopping`);
    return response.data;
  },

  // Mark as delivered
  markDelivered: async (id, actualAmount) => {
    const response = await api.put(`/requests/${id}/mark-delivered`, { actualAmount });
    return response.data;
  },

  // Confirm delivery
  confirmDelivery: async (id) => {
    const response = await api.put(`/requests/${id}/confirm-delivery`);
    return response.data;
  },
};

export default requestService;