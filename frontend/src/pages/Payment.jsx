import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import useAuth from '../hooks/useAuth';
import { formatDateTime, getPlanIcon } from '../utils/helpers';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      // Redirect from plans page without session - just show plans
      navigate('/plans');
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentService.verifyPayment(sessionId);
        if (res.success) {
          setPlanData(res.data);
          setStatus('success');
          // Refresh user data to reflect new plan
          await refreshUser();
        } else {
          setStatus('error');
          setError('Payment verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Could not verify your payment.');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#0f0f1a' }}>
      <div className="max-w-md w-full animate-slide-up">
        {status === 'verifying' && (
          <div className="glass-card p-10 text-center">
            <div className="spinner mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment...</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="glass-card p-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-green-500/30 bg-green-500/10">
              🎉
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-6">Your plan has been activated.</p>

            <div className="bg-white/5 rounded-xl p-5 mb-8 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Plan</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  {getPlanIcon(planData?.planType)} {planData?.planType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Activated</span>
                <span className="text-white text-sm">{formatDateTime(planData?.planStartTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Expires</span>
                <span className="text-white text-sm">{formatDateTime(planData?.planExpireTime)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6">A confirmation email has been sent to your inbox.</p>

            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn-primary no-underline justify-center py-3">
                🎮 Go to Dashboard
              </Link>
              <Link to="/plans" className="btn-outline no-underline justify-center text-center">
                View Plans
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="glass-card p-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl bg-red-500/10 border-2 border-red-500/30">
              ❌
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-3">Payment Issue</h2>
            <p className="text-gray-400 mb-8">{error}</p>
            <div className="flex flex-col gap-3">
              <Link to="/plans" className="btn-primary no-underline justify-center">
                Try Again
              </Link>
              <Link to="/dashboard" className="btn-outline no-underline justify-center text-center">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
