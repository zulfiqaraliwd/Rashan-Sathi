import api from './api';

const tripService = {
  // Naya trip banao
  createTrip: async (data) => {
    const response = await api.post('/trips', data);
    return response.data;
  },

  // Nearby trips
  getNearbyTrips: async (lng, lat, radius = 5) => {
    const response = await api.get('/trips/nearby', {
      params: { lng, lat, radius },
    });
    return response.data;
  },

  // Apne trips
  getMyTrips: async () => {
    const response = await api.get('/trips/my');
    return response.data;
  },

  // Ek trip ki details
  getTripById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  // Trip cancel
  cancelTrip: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  // Trip status update
  updateTripStatus: async (id, status) => {
    const response = await api.put(`/trips/${id}`, { status });
    return response.data;
  },
};

export default tripService;