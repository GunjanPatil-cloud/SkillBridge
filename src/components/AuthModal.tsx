import React, { useEffect, useState } from 'react';
import {
  X,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { signInWithEmail, signInWithGoogleFirebase, signUpWithEmail, isFirebaseConfigured } from '../services/firebase';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: any, sellerProfile: any, subscription: any) => void;
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
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmail(email.trim(), password);
      const result = await api.authenticateFirebase({
        idToken: await credential.user.getIdToken(),
        email: credential.user.email || email.trim(),
        fullName: credential.user.displayName || undefined,
      });
      onSuccess(result.user, result.sellerProfile, result.subscription);
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
      if (password.length < 6) {
        throw new Error('Password must contain at least 6 characters.');
      }
      const credential = await signUpWithEmail(email.trim(), password);
      const result = await api.authenticateFirebase({
        idToken: await credential.user.getIdToken(),
        email: credential.user.email || email.trim(),
        fullName,
        initialRole: initialRole === 'seller' ? 'seller' : 'buyer',
        collegeName: collegeName || undefined,
      });
      onSuccess(result.user, result.sellerProfile, result.subscription);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Google sign-in is not configured. Add VITE_FIREBASE_* variables and enable Google in Firebase Authentication.');
      }
      const credential = await signInWithGoogleFirebase();
      const firebaseUser = credential.user;
      const result = await api.authenticateFirebase({
        idToken: await firebaseUser.getIdToken(),
        email: firebaseUser.email || undefined,
        fullName: firebaseUser.displayName || undefined,
        avatarUrl: firebaseUser.photoURL || undefined,
      });
      onSuccess(result.user, result.sellerProfile, result.subscription);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
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
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'signup' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up (New Account)
          </button>
        </div>

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
                <label className="block text-xs font-bold text-slate-700 mb-1">Student or Company Email</label>
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
                <span>{loading ? 'Logging In...' : 'Log In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[11px] uppercase font-semibold text-slate-400">or continue with</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name <span className="text-emerald-600">*</span></label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Student or Business Email <span className="text-emerald-600">*</span></label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Password <span className="text-emerald-600">*</span></label>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Goal on SkillBridge</label>
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
                    < ShoppingBag className="w-4 h-4 mb-1 text-emerald-600" />
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
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
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[11px] uppercase font-semibold text-slate-400">or</span>
                <div className="grow border-t border-slate-200"></div>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted campus session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
