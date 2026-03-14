import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getInitials, getPlanBadgeClass, getPlanIcon } from '../utils/helpers';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: '🎮 Dashboard', show: isAuthenticated },
    { to: '/profile', label: '👤 Profile', show: isAuthenticated },
    { to: '/plans', label: '💎 Plans', show: isAuthenticated },
    { to: '/admin', label: '🛡️ Admin', show: isAdmin },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20"
         style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🎮</span>
            <span className="text-xl font-extrabold gradient-text">GamerHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => l.show).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors no-underline ${
                  location.pathname.startsWith(link.to)
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  {user?.profileImageUrl || user?.profileImage ? (
                    <img src={user.profileImageUrl || user.profileImage} alt={user.name}
                         className="w-8 h-8 rounded-full object-cover border-2 border-primary/50" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                         style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white">{user?.name}</p>
                    <span className={getPlanBadgeClass(user?.planType)} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {getPlanIcon(user?.planType)} {user?.planType}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-50 animate-slide-up">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 no-underline">
                      👤 Profile
                    </Link>
                    <Link to="/plans" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 no-underline">
                      💎 Upgrade Plan
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 no-underline">
                        🛡️ Admin Panel
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                      className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors no-underline">
                  Login
                </Link>
                <Link to="/signup"
                      className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white no-underline"
                      style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu btn */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-slide-up">
            {navLinks.filter(l => l.show).map(link => (
              <Link key={link.to} to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 no-underline">
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5">
                🚪 Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
