import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const { login, isAuthenticated, initializeAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback token
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) setError('Google login failed. Please try again.');
  }, [searchParams]);

  // Handle token in URL from OAuth redirect (via /auth/callback)
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setNeedsVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Email and password are required.');

    setLoading(true);
    setError('');
    try {
      const res = await login(form.email, form.password);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        setNeedsVerification(true);
        setError(data.message || 'Please verify your email first.');
      } else {
        setError(data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification(form.email);
      setResendMsg('Verification email sent! Check your inbox.');
    } catch (err) {
      setResendMsg('Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = () => authService.googleLogin();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#0f0f1a' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
             style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
             style={{ background: 'radial-gradient(circle, #f50057, transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="no-underline">
              <span className="text-4xl block mb-2">🎮</span>
              <span className="text-2xl font-extrabold gradient-text">GamerHub</span>
            </Link>
            <p className="text-gray-400 mt-2 text-sm">Welcome back, Gamer!</p>
          </div>

          {error && (
            <div className="alert alert-error mb-5">
              <span>⚠️</span>
              <div className="flex-1">
                <p>{error}</p>
                {needsVerification && (
                  <div className="mt-2">
                    {resendMsg ? (
                      <p className="text-sm text-green-400">{resendMsg}</p>
                    ) : (
                      <button onClick={handleResendVerification} disabled={resendLoading}
                              className="text-sm text-primary underline hover:no-underline">
                        {resendLoading ? 'Sending...' : 'Resend verification email →'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/15 text-white font-medium hover:bg-white/5 transition-all mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-gray-500">or login with email</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                     placeholder="john@example.com" className="input-field" required />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                       onChange={handleChange} placeholder="Your password"
                       className="input-field pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : '🎮 Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
