import api from './api';

const authService = {
  // Signup
  signup: async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  // Login
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('gamerhub_token', res.data.token);
      localStorage.setItem('gamerhub_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  // Logout
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('gamerhub_token');
    localStorage.removeItem('gamerhub_user');
  },

  // Verify email
  verifyEmail: async (token) => {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    return res.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  },

  // Get current user
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Google OAuth login - redirects to backend
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },

  // Store token from OAuth callback
  handleOAuthCallback: (token) => {
    if (token) {
      localStorage.setItem('gamerhub_token', token);
    }
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('gamerhub_user');
    return user ? JSON.parse(user) : null;
  },

  // Get stored token
  getToken: () => localStorage.getItem('gamerhub_token'),

  // Check if logged in
  isLoggedIn: () => !!localStorage.getItem('gamerhub_token'),
};

export default authService;
