import api from './api';

const adminService = {
  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Users
  getAllUsers: async (page = 1, limit = 20, search = '') => {
    const response = await api.get('/admin/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  toggleUserActive: async (id) => {
    const response = await api.put(`/admin/users/${id}/toggle-active`);
    return response.data;
  },

  updateVerification: async (id, status) => {
    const response = await api.put(`/admin/users/${id}/verification`, { status });
    return response.data;
  },

  // Disputes
  getAllDisputes: async () => {
    const response = await api.get('/admin/disputes');
    return response.data;
  },

  resolveDispute: async (id, data) => {
    const response = await api.put(`/admin/disputes/${id}/resolve`, data);
    return response.data;
  },

  // Transactions
  getAllTransactions: async (page = 1, limit = 20) => {
    const response = await api.get('/admin/transactions', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default adminService;