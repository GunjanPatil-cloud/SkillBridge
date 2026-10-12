import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { User, SellerProfile, SellerSubscription } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: User, sellerProfile: SellerProfile | null, subscription: SellerSubscription | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [initialRole, setInitialRole] = useState<'buyer' | 'seller'>('buyer');
  const [collegeName, setCollegeName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPersonas = [
    {
      id: 'user-student-1',
      name: 'Arjun Sharma',
      badge: 'PRO Seller (IIT Bombay)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-student-2',
      name: 'Priya Patel',
      badge: 'Free Seller (BITS Pilani)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-buyer-1',
      name: 'Rohan Mehta',
      badge: 'Buyer (Startup Founder)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleQuickLogin = async (personaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ personaId });
      onSuccess(res.user, res.sellerProfile, res.subscription);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: email.trim() });
      onSuccess(res.user, res.sellerProfile, res.subscription);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setError('Please enter your full name and email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.signup({
        email: email.trim(),
        fullName: fullName.trim(),
        initialRole,
        collegeName: collegeName.trim() || undefined,
      });
      onSuccess(res.user, res.sellerProfile, res.subscription);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {tab === 'login' ? 'Welcome Back to SkillBridge' : 'Join SkillBridge Campus'}
              </h2>
              <p className="text-xs text-emerald-100">
                {tab === 'login'
                  ? 'Access your buyer & seller campus dashboard'
                  : 'Start hiring or offering student services'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up (New Account)
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student or Company Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu or you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">Demo enabled</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Logging In...' : 'Log In & View Role Switcher'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Persona Logins */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                  Or Quick 1-Click Test Sign-In
                </span>
                <div className="space-y-1.5">
                  {quickPersonas.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLogin(p.id)}
                      disabled={loading}
                      className="w-full p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none">{p.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{p.badge}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700">Select →</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gunjan Patil"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student or Business Email <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@campus.edu or founder@startup.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Initial Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Goal on SkillBridge
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialRole('buyer')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      initialRole === 'buyer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mb-1 text-emerald-600" />
                    <span className="text-xs block">I want to hire talent</span>
                    <span className="text-[10px] text-slate-500 font-normal">Buyer View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInitialRole('seller')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      initialRole === 'seller'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mb-1 text-emerald-600" />
                    <span className="text-xs block">I want to offer services</span>
                    <span className="text-[10px] text-slate-500 font-normal">Seller View</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You can switch between Buyer and Seller roles at any time in the navbar after login.
                </p>
              </div>

              {initialRole === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay, Delhi University"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account & Enable Role Switcher'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted campus session with Firebase Auth authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
