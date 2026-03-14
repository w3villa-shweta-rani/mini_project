import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { initializeAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully!');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        const apiMessage = err.response?.data?.message;
        if (apiMessage && apiMessage.toLowerCase().includes('invalid or expired')) {
          setStatus('success');
          setMessage('Your email is already verified. You can log in now.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        setStatus('error');
        setMessage(apiMessage || 'Verification failed. Link may be expired.');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0f1a' }}>
      <div className="glass-card p-10 max-w-md w-full text-center animate-slide-up">
        {status === 'verifying' && (
          <>
            <div className="spinner mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
            <p className="text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl bg-green-500/20 border border-green-500/30">
              ✅
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Email Verified!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <p className="text-gray-500 text-sm mb-6">Redirecting to login in 3 seconds...</p>
            <Link to="/login" className="btn-primary no-underline">Go to Login →</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl bg-red-500/20 border border-red-500/30">
              ❌
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Verification Failed</h2>
            <p className="text-gray-400 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/signup" className="btn-primary no-underline justify-center">Create New Account</Link>
              <Link to="/login" className="btn-outline no-underline justify-center text-center">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
