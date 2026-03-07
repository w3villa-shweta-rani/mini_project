import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import './styles/global.scss';

// Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/payment/success" element={
            <ProtectedRoute><Payment /></ProtectedRoute>
          } />

          {/* Public only (redirect if logged in) */}
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected: authenticated users */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/plans" element={<Plans />} />
          </Route>

          {/* Admin only */}
          <Route element={<AdminRoute><DashboardLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: '#0f0f1a' }}>
              <p className="text-8xl mb-6">🎮</p>
              <h1 className="text-4xl font-extrabold text-white mb-3">404 — Not Found</h1>
              <p className="text-gray-400 mb-8">This page doesn't exist in the GamerHub universe.</p>
              <a href="/" className="btn-primary no-underline">← Back to Home</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
