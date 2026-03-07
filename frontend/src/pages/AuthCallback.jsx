import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

// This page handles the redirect from Google OAuth callback
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initializeAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authService.handleOAuthCallback(token);
      initializeAuth().then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-gray-400">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
