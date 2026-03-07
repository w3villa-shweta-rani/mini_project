import api from './api';

const paymentService = {
  // Get all plans
  getPlans: async () => {
    const res = await api.get('/payment/plans');
    return res.data;
  },

  // Create checkout session
  createCheckout: async (planType) => {
    const res = await api.post('/payment/create-checkout', { planType });
    return res.data;
  },

  // Verify payment after redirect
  verifyPayment: async (sessionId) => {
    const res = await api.get(`/payment/verify?session_id=${sessionId}`);
    return res.data;
  },

  // Redirect to Stripe checkout
  redirectToCheckout: async (planType) => {
    const res = await api.post('/payment/create-checkout', { planType });
    if (res.data?.data?.url) {
      window.location.href = res.data.data.url;
    }
    return res.data;
  },
};

export default paymentService;
