import React, { useState } from 'react';
import {
  Briefcase,
  ShoppingBag,
  Sparkles,
  GraduationCap,
  ChevronDown,
  ArrowRightLeft,
  UserCheck,
  CheckCircle2,
  Crown,
  LogIn,
  UserPlus,
  LogOut,
  UserCog,
} from 'lucide-react';
import { User, SellerProfile, SellerSubscription } from '../types';

interface NavbarProps {
  currentUser: User | null;
  sellerProfile: SellerProfile | null;
  subscription: SellerSubscription | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  onSwitchRole: (targetRole: 'buyer' | 'seller') => void;
  onSwitchDemoUser: (userId: string) => void;
  onOpenOnboarding: () => void;
  onOpenAuth: (initialTab: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  sellerProfile,
  subscription,
  currentView,
  setCurrentView,
  onSwitchRole,
  onSwitchDemoUser,
  onOpenOnboarding,
  onOpenAuth,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isLoggedIn = Boolean(currentUser);
  const isSeller = currentUser?.activeRole === 'seller';
  const isPro = subscription?.planId.includes('premium');

  const demoAccounts = [
    {
      id: 'user-student-1',
      name: 'Arjun Sharma',
      role: 'PRO Seller (IIT Bombay)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-student-2',
      name: 'Priya Patel',
      role: 'Free Seller (BITS Pilani)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-buyer-1',
      name: 'Rohan Mehta',
      role: 'Buyer (Startup Founder)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-admin-1',
      name: 'Platform Auditor',
      role: 'Security Admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleRoleToggle = () => {
    if (!isLoggedIn) {
      onOpenAuth('login');
      return;
    }

    if (isSeller) {
      onSwitchRole('buyer');
    } else {
      if (!sellerProfile || !sellerProfile.isOnboarded) {
        onOpenOnboarding();
      } else {
        onSwitchRole('seller');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView(isSeller ? 'seller-dashboard' : 'marketplace')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Skill<span className="text-emerald-600">Bridge</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Campus
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none">Student Talent Marketplace</p>
              </div>
            </button>

            {/* Role Switcher Pill — VISIBLE ONLY AFTER LOGIN */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 animate-in fade-in duration-200">
                <button
                  onClick={() => onSwitchRole('buyer')}
                  className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    !isSeller
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  Buyer View
                </button>
                <button
                  onClick={handleRoleToggle}
                  className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    isSeller
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Seller View
                  {isPro && isSeller && (
                    <Crown className="w-3 h-3 text-amber-300 ml-0.5 fill-amber-300" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {!isSeller ? (
              // Buyer / Visitor Mode Navigation
              <>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'marketplace'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Explore Services
                </button>
                <button
                  onClick={() => setCurrentView('projects')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'projects'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Project Bidding
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => setCurrentView('orders')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentView === 'orders'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Orders & Gigs
                  </button>
                )}
              </>
            ) : (
              // Seller Mode Navigation (only available when logged in)
              <>
                <button
                  onClick={() => setCurrentView('seller-dashboard')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'seller-dashboard'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Seller Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('projects')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'projects'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Bid on Tasks
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    currentView === 'orders'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Client Deliveries
                </button>
                <button
                  onClick={() => setCurrentView('subscriptions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    currentView === 'subscriptions'
                      ? 'text-emerald-800 bg-amber-50 border border-amber-200'
                      : 'text-amber-800 hover:bg-amber-50/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {isPro ? 'Manage PRO Reach' : 'Boost Reach (PRO)'}
                </button>
              </>
            )}
          </nav>

          {/* Right Action: Logged In (Persona & Avatar) vs Logged Out (Login / Sign Up) */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              // LOGGED OUT ACTIONS: Login & Sign Up buttons
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              // LOGGED IN ACTIONS: Persona Quick Switcher & User Avatar
              <>
                {/* Demo User Switcher Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDemoMenu(!showDemoMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Switch test persona"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Persona:</span>
                    <span className="font-semibold">{currentUser?.fullName.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showDemoMenu && (
                    <div
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setShowDemoMenu(false)}
                    >
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Test Persona
                      </div>
                      {demoAccounts.map(account => (
                        <button
                          key={account.id}
                          onClick={() => onSwitchDemoUser(account.id)}
                          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                            currentUser?.id === account.id ? 'bg-emerald-50/70' : ''
                          }`}
                        >
                          <img
                            src={account.avatar}
                            alt={account.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-900 truncate">{account.name}</p>
                              {currentUser?.id === account.id && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{account.role}</p>
                          </div>
                        </button>
                      ))}
                      <div className="mt-2 pt-2 border-t border-slate-100 px-3 text-[11px] text-slate-400">
                        Test roles & permissions across Buyer, Seller, and Admin boundaries.
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-400/40 transition-all cursor-pointer"
                  >
                    <img
                      src={
                        currentUser?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={currentUser?.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                    />
                  </button>

                  {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{currentUser?.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                            {isSeller ? 'Seller Mode Active' : 'Buyer Mode Active'}
                          </span>
                          {isSeller && isPro && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> PRO
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleRoleToggle}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Switch to {isSeller ? 'Buyer Mode' : 'Seller Mode'}
                        </button>

                        {isSeller && (
                          <button
                            onClick={() => setCurrentView('subscriptions')}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Seller Subscription & Boost
                          </button>
                        )}

                        <button
                          onClick={() => setCurrentView('orders')}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                          My Orders & Deliveries
                        </button>

                        <button
                          onClick={() => setCurrentView('edit-profile')}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <UserCog className="w-3.5 h-3.5 text-emerald-600" />
                          Edit Profile
                        </button>

                        <div className="my-1 border-t border-slate-100"></div>

                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/80 px-2 py-2">
        <button
          onClick={() => setCurrentView(isSeller ? 'seller-dashboard' : 'marketplace')}
          className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
            currentView === 'marketplace' || currentView === 'seller-dashboard'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-600'
          }`}
        >
          {isSeller ? 'Dashboard' : 'Explore'}
        </button>
        <button
          onClick={() => setCurrentView('projects')}
          className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
            currentView === 'projects' ? 'text-emerald-700 font-bold' : 'text-slate-600'
          }`}
        >
          Projects
        </button>
        {isLoggedIn && (
          <>
            <button
              onClick={() => setCurrentView('orders')}
              className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
                currentView === 'orders' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setCurrentView('edit-profile')}
              className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
                currentView === 'edit-profile' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              Profile
            </button>
          </>
        )}
        {isLoggedIn && isSeller && (
          <button
            onClick={() => setCurrentView('subscriptions')}
            className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${
              currentView === 'subscriptions' ? 'text-amber-700 font-bold' : 'text-slate-600'
            }`}
          >
            PRO Reach
          </button>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleRoleToggle}
            className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full cursor-pointer"
          >
            {isSeller ? 'Buyer' : 'Seller'}
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full cursor-pointer"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
};
