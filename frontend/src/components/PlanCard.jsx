import paymentService from '../services/paymentService';
import { useState } from 'react';
import { formatPrice } from '../utils/helpers';

const planConfig = {
  Free: {
    icon: '🆓',
    gradient: 'from-gray-700 to-gray-800',
    border: 'border-gray-600/30',
    glow: '',
    badge: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
  },
  Silver: {
    icon: '🥈',
    gradient: 'from-gray-400/20 to-gray-500/10',
    border: 'border-gray-400/30',
    glow: 'shadow-[0_0_20px_rgba(192,192,192,0.15)]',
    badge: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  },
  Gold: {
    icon: '🥇',
    gradient: 'from-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-500/40',
    glow: 'shadow-[0_0_30px_rgba(255,215,0,0.2)]',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    popular: true,
  },
};

const PlanCard = ({ planType, planData, currentPlan, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const config = planConfig[planType] || planConfig.Free;
  const isCurrentPlan = currentPlan === planType;
  const isFree = planType === 'Free';

  const handleSelect = async () => {
    if (isCurrentPlan || isFree || loading) return;
    setLoading(true);
    try {
      if (onSelect) {
        await onSelect(planType);
      } else {
        await paymentService.redirectToCheckout(planType);
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-gradient-to-b ${config.gradient} ${config.border} ${config.glow} p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1`}>
      {/* Popular badge */}
      {config.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-bold rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
            ⭐ POPULAR
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">{config.icon}</span>
        <h3 className="text-2xl font-extrabold text-white mb-2">{planType}</h3>
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${config.badge}`}>
          {isFree ? 'Forever Free' : `${planData?.duration}h Access`}
        </span>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {isFree ? (
          <p className="text-4xl font-extrabold text-white">$0</p>
        ) : (
          <>
            <p className="text-4xl font-extrabold text-white">
              {formatPrice(planData?.price || 0)}
            </p>
            <p className="text-gray-400 text-sm mt-1">one-time payment</p>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {isFree ? (
          ['Basic gaming profile', 'Community access', 'Browse game listings', 'Standard matchmaking'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-green-400 flex-shrink-0">✓</span> {f}
            </li>
          ))
        ) : (
          planData?.features?.map(feature => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))
        )}
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleSelect}
        disabled={isCurrentPlan || isFree || loading}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
          isCurrentPlan
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
            : isFree
            ? 'bg-white/5 text-gray-500 cursor-default'
            : loading
            ? 'opacity-50 cursor-not-allowed text-white'
            : 'text-white hover:opacity-90 hover:shadow-lg'
        }`}
        style={!isCurrentPlan && !isFree && !loading ? { background: 'linear-gradient(135deg, #6c63ff, #f50057)' } : {}}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : isCurrentPlan ? '✓ Current Plan' : isFree ? 'Default Plan' : `Upgrade to ${planType}`}
      </button>
    </div>
  );
};

export default PlanCard;
