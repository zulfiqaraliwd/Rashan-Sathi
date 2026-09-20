import api from './api';

const paymentService = {
  // Payment mark paid
  markPaid: async (requestId, data) => {
    const response = await api.post(`/payments/${requestId}/mark-paid`, data);
    return response.data;
  },

  // Confirm payment (shopper)
  confirmPayment: async (requestId) => {
    const response = await api.post(`/payments/${requestId}/confirm`);
    return response.data;
  },

  // Dispute payment
  disputePayment: async (requestId, reason) => {
    const response = await api.post(`/payments/${requestId}/dispute`, { reason });
    return response.data;
  },

  // My transactions
  getMyTransactions: async () => {
    const response = await api.get('/payments/my');
    return response.data;
  },
};

export default paymentService;