import React, { useState } from 'react';
import { 
  Camera, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess, onNavigate }) => {
  const { login, register, loginWithDemoAdmin, loginWithDemoUser } = useAuth();
  const { showToast } = useToast();

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        showToast('Welcome back to Ashish Wedding Film Studio!', 'success');
      } else {
        if (!name.trim()) {
          showToast('Please provide your full name.', 'error');
          setLoading(false);
          return;
        }
        await register(name, email, phone, password);
        showToast('Account created successfully! Welcome to the studio.', 'success');
      }
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please check details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setLoading(true);
    try {
      if (role === 'admin') {
        await loginWithDemoAdmin();
        showToast('Logged in as Studio Admin (Ashish Ji)', 'success');
      } else {
        await loginWithDemoUser();
        showToast('Logged in as Client (Priya Sharma)', 'success');
      }
      onSuccess();
    } catch (err: any) {
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/20 font-bold mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-tight">
            {isLogin ? 'Sign In to Your Account' : 'Create Studio Client Account'}
          </h1>
          <p className="text-xs text-neutral-400">
            {isLogin 
              ? 'Access your event bookings, Karizma album approvals & payment receipts'
              : 'Join Ashish Wedding Film Studio for seamless booking & reel delivery'}
          </p>
        </div>

        {/* Demo Quick Login Buttons */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Quick 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-admin-login-btn"
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Studio Desk</span>
            </button>
            <button
              id="demo-user-login-btn"
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span>Client Portal</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Phone Number (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 87090 17294"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLogin ? 'Sign In to Studio' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
            {isLogin ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
