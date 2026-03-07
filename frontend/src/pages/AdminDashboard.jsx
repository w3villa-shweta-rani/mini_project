import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDate, getPlanIcon } from '../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.stats.totalUsers, icon: '👥', color: '#6c63ff' },
    { label: 'Verified Users', value: stats?.stats.verifiedUsers, icon: '✅', color: '#4caf50' },
    { label: 'Premium Users', value: stats?.stats.premiumUsers, icon: '💎', color: '#ffd700' },
    { label: 'Silver Users', value: stats?.stats.silverUsers, icon: '🥈', color: '#c0c0c0' },
    { label: 'Gold Users', value: stats?.stats.goldUsers, icon: '🥇', color: '#ffd700' },
    { label: 'Admin Users', value: stats?.stats.adminUsers, icon: '🛡️', color: '#f50057' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">🛡️ Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and user statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-4 text-center hover:-translate-y-1 transition-all">
            <span className="text-3xl block mb-2">{card.icon}</span>
            <p className="text-2xl font-extrabold text-white">{card.value ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-5">Plan Distribution</h2>
          <div className="space-y-4">
            {[
              { plan: 'Free', count: stats?.stats.freeUsers, total: stats?.stats.totalUsers, color: '#8892b0' },
              { plan: 'Silver', count: stats?.stats.silverUsers, total: stats?.stats.totalUsers, color: '#c0c0c0' },
              { plan: 'Gold', count: stats?.stats.goldUsers, total: stats?.stats.totalUsers, color: '#ffd700' },
            ].map(item => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <div key={item.plan}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300">{getPlanIcon(item.plan)} {item.plan}</span>
                    <span className="text-white font-semibold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-white">Recent Members</h2>
            <a href="/admin/users" className="text-sm text-primary hover:underline no-underline">View all →</a>
          </div>
          <div className="space-y-3">
            {stats?.recentUsers?.map(u => (
              <div key={u._id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {u.profileImage ? (
                    <img src={u.profileImage} alt={u.name}
                         className="w-8 h-8 rounded-full object-cover border border-primary/30 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{getPlanIcon(u.planType)} {u.planType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
