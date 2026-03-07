/**
 * GamerHub Frontend Utility Helpers
 */

// String helpers
export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str = '', maxLen = 30) => {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

// Date/Time helpers
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getTimeRemaining = (expireTime) => {
  if (!expireTime) return '';
  const diff = new Date(expireTime) - new Date();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s remaining`;
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`;
  return `${seconds}s remaining`;
};

export const getTimeRemainingPercent = (startTime, expireTime) => {
  if (!startTime || !expireTime) return 0;
  const total = new Date(expireTime) - new Date(startTime);
  const remaining = new Date(expireTime) - new Date();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
};

// Plan helpers
export const getPlanIcon = (planType) => {
  const icons = { Free: '🆓', Silver: '🥈', Gold: '🥇' };
  return icons[planType] || '🆓';
};

export const getPlanBadgeClass = (planType) => {
  const classes = { Free: 'badge badge-free', Silver: 'badge badge-silver', Gold: 'badge badge-gold' };
  return classes[planType] || 'badge badge-free';
};

export const getPlanColor = (planType) => {
  const colors = { Free: '#8892b0', Silver: '#c0c0c0', Gold: '#ffd700' };
  return colors[planType] || '#8892b0';
};

// Price helpers
export const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

// Validation helpers
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
export const isValidPassword = (password) => password && password.length >= 6;

// Error message extractor
export const getErrorMessage = (error) => (
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.'
);
