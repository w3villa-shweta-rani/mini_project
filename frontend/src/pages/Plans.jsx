import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import PlanCard from '../components/PlanCard';
import paymentService from '../services/paymentService';
import { formatDateTime, getTimeRemaining, getPlanIcon } from '../utils/helpers';

const Plans = () => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await paymentService.getPlans();
        setPlans(res.data || {});
      } catch (err) {
        setError('Failed to load plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = async (planType) => {
    await paymentService.redirectToCheckout(planType);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Choose Your <span className="gradient-text">Plan</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Unlock premium gaming features. One-time payment, instant access.
        </p>
      </div>

      {/* Current plan status */}
      {user?.planType !== 'Free' && (
        <div className="glass-card p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getPlanIcon(user.planType)}</span>
            <div>
              <p className="text-white font-semibold">Active: {user.planType} Plan</p>
              <p className="text-gray-400 text-sm">
                Expires: {formatDateTime(user.planExpireTime)} •{' '}
                <span style={{ color: user.planType === 'Gold' ? '#ffd700' : '#c0c0c0' }}>
                  {getTimeRemaining(user.planExpireTime)}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="badge badge-silver text-xs">
              Active
            </span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error mb-6">⚠️ {error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <PlanCard
            planType="Free"
            planData={null}
            currentPlan={user?.planType}
            onSelect={handleSelectPlan}
          />
          <PlanCard
            planType="Silver"
            planData={plans.Silver}
            currentPlan={user?.planType}
            onSelect={handleSelectPlan}
          />
          <PlanCard
            planType="Gold"
            planData={plans.Gold}
            currentPlan={user?.planType}
            onSelect={handleSelectPlan}
          />
        </div>
      )}

      {/* FAQ / Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">📋 Plan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { q: 'How long does a plan last?', a: 'Silver gives you 6 hours of access. Gold gives you 12 hours. After expiry, you automatically return to Free.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit and debit cards via Stripe. All payments are 100% secure.' },
            { q: 'Can I upgrade mid-plan?', a: 'Yes! You can purchase a new plan anytime. The new plan will activate immediately.' },
          ].map((faq, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <p className="font-semibold text-white mb-2">{faq.q}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Test card notice */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-yellow-400 text-sm">🧪 Stripe Test Mode: Use card <code className="font-mono">4242 4242 4242 4242</code></span>
        </div>
      </div>
    </div>
  );
};

export default Plans;
