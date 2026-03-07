import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';

const features = [
  { icon: '🎮', title: 'Gaming Community', desc: 'Connect with thousands of gamers worldwide in real-time.' },
  { icon: '🏆', title: 'Tournaments', desc: 'Join exclusive Gold-tier tournaments and win prizes.' },
  { icon: '💎', title: 'Premium Plans', desc: 'Unlock Silver & Gold plans for premium features.' },
  { icon: '🌍', title: 'Location Matching', desc: 'Find gamers near you with Google Maps integration.' },
  { icon: '⚡', title: 'Fast Matchmaking', desc: 'Priority matchmaking for Silver and Gold members.' },
  { icon: '🛡️', title: 'Secure Platform', desc: 'JWT auth, email verification, and encrypted data.' },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
               style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
               style={{ background: 'radial-gradient(circle, #f50057, transparent)' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <span className="text-sm text-primary font-medium">🎮 The Ultimate Gaming Community Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-white">Level Up Your</span>
            <br />
            <span className="gradient-text">Gaming Life</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join GamerHub — where gamers connect, compete, and dominate.
            Create your profile, find your squad, and unlock premium features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard"
                    className="btn-primary text-lg px-8 py-4 no-underline">
                🎮 Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup"
                      className="btn-primary text-lg px-8 py-4 no-underline">
                  🚀 Start for Free
                </Link>
                <Link to="/login"
                      className="btn-outline text-lg px-8 py-4 no-underline">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { num: '50K+', label: 'Gamers' },
              { num: '1K+', label: 'Tournaments' },
              { num: '99.9%', label: 'Uptime' },
              { num: '24/7', label: 'Support' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold gradient-text">{stat.num}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Everything You Need to <span className="gradient-text">Win</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            GamerHub gives you the tools to build your gaming identity and connect with the best.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i}
                 className="glass-card p-6 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                 style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="text-4xl mb-4 block">{f.icon}</span>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-4" style={{ background: '#0d0d1a' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 mb-10">Choose the plan that powers your gaming journey.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { name: 'Free', icon: '🆓', price: '$0', highlight: false },
              { name: 'Silver', icon: '🥈', price: '$9.99', highlight: false },
              { name: 'Gold', icon: '🥇', price: '$19.99', highlight: true },
            ].map(plan => (
              <div key={plan.name}
                   className={`p-6 rounded-2xl border text-center transition-all ${
                     plan.highlight
                       ? 'border-yellow-500/40 bg-yellow-500/5 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
                       : 'border-white/10 bg-white/3'
                   }`}>
                <span className="text-4xl block mb-3">{plan.icon}</span>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-2xl font-extrabold gradient-text mt-2">{plan.price}</p>
              </div>
            ))}
          </div>

          <Link to="/plans" className="btn-primary text-lg px-8 py-4 no-underline inline-flex">
            💎 View All Plans
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 animate-glow">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to <span className="gradient-text">Dominate?</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join over 50,000 gamers who have already leveled up with GamerHub.
          </p>
          <Link to="/signup" className="btn-primary text-lg px-10 py-4 no-underline">
            🎮 Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 <span className="gradient-text font-semibold">GamerHub</span>. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
