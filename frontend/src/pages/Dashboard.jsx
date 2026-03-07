import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import { formatDateTime, getTimeRemaining, getTimeRemainingPercent, getPlanIcon } from '../utils/helpers';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [planStatus, setPlanStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchPlanStatus = async () => {
      try {
        const res = await api.get('/user/plan-status');
        setPlanStatus(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPlanStatus();
  }, []);

  // Live countdown timer
  useEffect(() => {
    if (!planStatus?.planExpireTime || planStatus?.planType === 'Free') return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(planStatus.planExpireTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [planStatus]);

  const planPercent = planStatus
    ? getTimeRemainingPercent(planStatus.planStartTime, planStatus.planExpireTime)
    : 0;

  const stats = [
    { label: 'Current Plan', value: user?.planType || 'Free', icon: getPlanIcon(user?.planType), color: user?.planType === 'Gold' ? '#ffd700' : user?.planType === 'Silver' ? '#c0c0c0' : '#8892b0' },
    { label: 'Account Type', value: user?.socialProvider === 'google' ? 'Google' : 'Email', icon: user?.socialProvider === 'google' ? '🔵' : '📧', color: '#6c63ff' },
    { label: 'Status', value: user?.isVerified ? 'Verified' : 'Unverified', icon: user?.isVerified ? '✅' : '⚠️', color: user?.isVerified ? '#4caf50' : '#ff9800' },
    { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: '📅', color: '#64ffda' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 🎮
        </h1>
        <p className="text-gray-400">Here's your GamerHub overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 hover:border-primary/30 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Plan Status Card */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Plan Status</h2>
          <Link to="/plans" className="text-sm text-primary hover:underline no-underline">
            Upgrade Plan →
          </Link>
        </div>

        {user?.planType === 'Free' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-gray-300">You're on the <span className="font-bold text-white">Free</span> plan.</p>
              <p className="text-gray-500 text-sm mt-1">Upgrade to unlock premium features and tournaments.</p>
            </div>
            <Link to="/plans" className="btn-primary no-underline text-sm whitespace-nowrap">
              💎 Upgrade Now
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPlanIcon(user?.planType)}</span>
                <div>
                  <p className="text-white font-bold">{user?.planType} Plan</p>
                  <p className="text-gray-400 text-xs">Expires: {formatDateTime(planStatus?.planExpireTime)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: user?.planType === 'Gold' ? '#ffd700' : '#c0c0c0' }}>
                  {timeLeft || getTimeRemaining(planStatus?.planExpireTime)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${planPercent}%`,
                  background: user?.planType === 'Gold'
                    ? 'linear-gradient(90deg, #ffd700, #ff8c00)'
                    : 'linear-gradient(90deg, #c0c0c0, #808080)',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(planPercent)}% time remaining</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/profile', icon: '👤', title: 'Manage Profile', desc: 'Update info, photo & address', color: '#6c63ff' },
          { to: '/plans', icon: '💎', title: 'View Plans', desc: 'Silver & Gold plans available', color: '#ffd700' },
          ...(user?.role === 'admin' ? [{ to: '/admin', icon: '🛡️', title: 'Admin Panel', desc: 'Manage all users', color: '#f50057' }] : []),
        ].map((action, i) => (
          <Link key={i} to={action.to}
                className="glass-card p-5 hover:border-primary/40 transition-all hover:-translate-y-1 no-underline group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                   style={{ background: `${action.color}20`, border: `1px solid ${action.color}30` }}>
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-primary transition-colors">{action.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
