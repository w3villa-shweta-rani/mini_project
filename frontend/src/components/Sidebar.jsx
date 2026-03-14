import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getInitials, getPlanBadgeClass, getPlanIcon } from '../utils/helpers';

const Sidebar = ({ collapsed = false }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: '🎮', label: 'Dashboard' },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/games', icon: '🕹️', label: 'Games' },
    { to: '/plans', icon: '💎', label: 'Plans' },
  ];

  const adminLinks = [
    { to: '/admin', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
  ];

  return (
    <aside className={`flex flex-col h-full border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
           style={{ background: '#0d0d1a' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <span className="text-2xl flex-shrink-0">🎮</span>
        {!collapsed && (
          <span className="text-lg font-extrabold gradient-text">GamerHub</span>
        )}
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user.profileImageUrl || user.profileImage ? (
              <img src={user.profileImageUrl || user.profileImage} alt={user.name}
                   className="w-10 h-10 rounded-full object-cover border-2 border-primary/50" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                {getInitials(user.name)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <span className={getPlanBadgeClass(user.planType)} style={{ fontSize: '0.65rem' }}>
                {getPlanIcon(user.planType)} {user.planType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive ? { background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(245,0,87,0.1))', borderLeft: '2px solid #6c63ff' } : {}
            }
          >
            <span className="text-lg flex-shrink-0">{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className={`pt-4 pb-1 ${!collapsed ? 'px-3' : 'text-center'}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {!collapsed ? 'Admin' : '—'}
              </p>
            </div>
            {adminLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { background: 'rgba(245,0,87,0.1)', borderLeft: '2px solid #f50057' } : {}
                }
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-lg flex-shrink-0">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
