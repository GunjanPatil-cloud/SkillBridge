/**
 * SkillBridge — Main Application
 * Dual Roles (Buyer/Seller), Seller Subscriptions, Razorpay Integration,
 * Student Authentication (Log In / Sign Up) & Role Switcher.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MarketplaceView } from './views/MarketplaceView';
import { ProjectBiddingView } from './views/ProjectBiddingView';
import { SellerDashboardView } from './views/SellerDashboardView';
import { OrdersView } from './views/OrdersView';
import { SubscriptionsView } from './views/SubscriptionsView';

import { AuthModal } from './components/AuthModal';
import { SellerOnboardingModal } from './components/SellerOnboardingModal';
import { GigDetailsModal } from './components/GigDetailsModal';
import { OrderRequirementModal } from './components/OrderRequirementModal';
import { PostProjectModal } from './components/PostProjectModal';
import { SubmitProposalModal } from './components/SubmitProposalModal';
import { DeliverWorkModal } from './components/DeliverWorkModal';
import { ReviewModal } from './components/ReviewModal';
import { RazorpayModal } from './components/RazorpayModal';

import { api, getAuthToken } from './services/api';
import { User, SellerProfile, SellerSubscription, Gig, Project, Order, Review, SubscriptionPlan } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [subscription, setSubscription] = useState<SellerSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState<string>('marketplace');

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [gigReviews, setGigReviews] = useState<Review[]>([]);
  const [showGigDetailsModal, setShowGigDetailsModal] = useState(false);
  const [showOrderRequirementModal, setShowOrderRequirementModal] = useState(false);
  const [showPostProjectModal, setShowPostProjectModal] = useState(false);
  const [biddingProject, setBiddingProject] = useState<Project | null>(null);
  const [showSubmitProposalModal, setShowSubmitProposalModal] = useState(false);
  const [deliverOrder, setDeliverOrder] = useState<Order | null>(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUserData = async () => {
    const token = getAuthToken();
    if (!token) {
      // User starts logged out so they see the Login / Sign Up buttons
      setCurrentUser(null);
      setSellerProfile(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.getMe();
      setCurrentUser(res.user);
      setSellerProfile(res.sellerProfile);
      setSubscription(res.subscription);

      if (res.user.activeRole === 'seller') {
        setCurrentView('seller-dashboard');
      }
    } catch (err) {
      // If token expired or invalid, reset cleanly
      api.logout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // Role switching
  const handleSwitchRole = async (targetRole: 'buyer' | 'seller') => {
    if (!currentUser) {
      setAuthModalTab('login');
      setShowAuthModal(true);
      return;
    }

    if (targetRole === 'seller' && (!sellerProfile || !sellerProfile.isOnboarded)) {
      setShowOnboardingModal(true);
      return;
    }

    try {
      const res = await api.switchRole(targetRole);
      setCurrentUser(res.user);
      if (targetRole === 'seller') {
        setCurrentView('seller-dashboard');
        showToast('Switched to Seller Mode. Welcome to your campus creator studio!');
      } else {
        setCurrentView('marketplace');
        showToast('Switched to Buyer Mode. Explore services and student talent!');
      }
    } catch (err: any) {
      if (err.data?.error === 'SELLER_ONBOARDING_REQUIRED') {
        setShowOnboardingModal(true);
      } else {
        alert(err.message || 'Failed to switch role');
      }
    }
  };

  const handleSwitchDemoUser = async (userId: string) => {
    try {
      const res = await api.switchDemoUser(userId);
      setCurrentUser(res.user);
      setSellerProfile(res.sellerProfile);
      setSubscription(res.subscription);

      if (res.user.activeRole === 'seller') {
        setCurrentView('seller-dashboard');
      } else {
        setCurrentView('marketplace');
      }
      showToast(`Switched active user to ${res.user.fullName} (${res.user.activeRole.toUpperCase()} mode)`);
    } catch (err: any) {
      alert(err.message || 'Failed to switch demo user');
    }
  };

  const handleAuthSuccess = (
    user: User,
    profile: SellerProfile | null,
    sub: SellerSubscription | null
  ) => {
    setCurrentUser(user);
    setSellerProfile(profile);
    setSubscription(sub);
    if (user.activeRole === 'seller') {
      setCurrentView('seller-dashboard');
    } else {
      setCurrentView('marketplace');
    }
    showToast(`Welcome back, ${user.fullName}! Role switcher is now enabled in the navigation.`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setSellerProfile(null);
    setSubscription(null);
    setCurrentView('marketplace');
    showToast('Logged out successfully.');
  };

  const handleOnboardingSuccess = (profile: SellerProfile, user: User) => {
    setSellerProfile(profile);
    setCurrentUser(user);
    setCurrentView('seller-dashboard');
    showToast('Congratulations! Seller onboarding complete. You can now post gigs and bid on projects.');
  };

  const handleSelectGig = async (gig: Gig) => {
    setSelectedGig(gig);
    setShowGigDetailsModal(true);
    try {
      const details = await api.getGigById(gig.id);
      setGigReviews(details.reviews || []);
    } catch {
      setGigReviews([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation (Role Switcher visible after login; Login/Sign Up buttons if logged out) */}
      <Navbar
        currentUser={currentUser}
        sellerProfile={sellerProfile}
        subscription={subscription}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSwitchRole={handleSwitchRole}
        onSwitchDemoUser={handleSwitchDemoUser}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenAuth={initialTab => {
          setAuthModalTab(initialTab);
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-600 mt-4">Connecting to SkillBridge platform...</p>
          </div>
        ) : (
          <>
            {currentView === 'marketplace' && (
              <MarketplaceView
                onSelectGig={handleSelectGig}
                onPostProjectClick={() => {
                  if (!currentUser) {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  } else {
                    setShowPostProjectModal(true);
                  }
                }}
                onSwitchToSeller={() => {
                  if (!currentUser) {
                    setAuthModalTab('signup');
                    setShowAuthModal(true);
                  } else {
                    handleSwitchRole('seller');
                  }
                }}
              />
            )}

            {currentView === 'projects' && (
              <ProjectBiddingView
                currentUser={currentUser}
                sellerProfile={sellerProfile}
                onOpenPostProject={() => {
                  if (!currentUser) {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  } else {
                    setShowPostProjectModal(true);
                  }
                }}
                onOpenSubmitProposal={proj => {
                  if (!currentUser) {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  } else {
                    setBiddingProject(proj);
                    setShowSubmitProposalModal(true);
                  }
                }}
                onOrderCreated={newOrder => {
                  showToast(`Contract initialized! Order #${newOrder.orderNumber} created.`);
                  setCurrentView('orders');
                }}
                onOpenOnboarding={() => setShowOnboardingModal(true)}
              />
            )}

            {currentView === 'seller-dashboard' && (
              <SellerDashboardView
                currentUser={currentUser}
                sellerProfile={sellerProfile}
                subscription={subscription}
                onOpenDeliverModal={ord => {
                  setDeliverOrder(ord);
                  setShowDeliverModal(true);
                }}
                onOpenSubscriptions={() => setCurrentView('subscriptions')}
                onProfileUpdated={prof => setSellerProfile(prof)}
              />
            )}

            {currentView === 'orders' && (
              <OrdersView
                currentUser={currentUser}
                onOpenDeliverModal={ord => {
                  setDeliverOrder(ord);
                  setShowDeliverModal(true);
                }}
                onOpenReviewModal={ord => {
                  setReviewOrder(ord);
                  setShowReviewModal(true);
                }}
              />
            )}

            {currentView === 'subscriptions' && (
              <SubscriptionsView
                currentSubscription={subscription}
                onOpenRazorpay={plan => {
                  setCheckoutPlan(plan);
                  setShowRazorpayModal(true);
                }}
                onSubscriptionUpdated={sub => {
                  setSubscription(sub);
                  showToast('Subscription updated.');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Footer without Audit/n8n buttons */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SkillBridge</span>
            <span>•</span>
            <span>Empowering college student freelancers with fair opportunities, micro-gigs, and dual-role accounts.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setCurrentView('marketplace')} className="hover:text-emerald-700 cursor-pointer">
              Explore Services
            </button>
            <button onClick={() => setCurrentView('projects')} className="hover:text-emerald-700 cursor-pointer">
              Project Bidding
            </button>
            {currentUser && (
              <button onClick={() => setCurrentView('subscriptions')} className="hover:text-emerald-700 cursor-pointer">
                PRO Reach
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <AuthModal
        isOpen={showAuthModal}
        initialTab={authModalTab}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      <SellerOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSuccess={handleOnboardingSuccess}
      />

      <GigDetailsModal
        gig={selectedGig}
        reviews={gigReviews}
        isOpen={showGigDetailsModal}
        onClose={() => setShowGigDetailsModal(false)}
        onOrderClick={gig => {
          if (!currentUser) {
            setShowGigDetailsModal(false);
            setAuthModalTab('login');
            setShowAuthModal(true);
          } else {
            setShowGigDetailsModal(false);
            setShowOrderRequirementModal(true);
          }
        }}
      />

      <OrderRequirementModal
        gig={selectedGig}
        isOpen={showOrderRequirementModal}
        onClose={() => setShowOrderRequirementModal(false)}
        onSuccess={order => {
          showToast(`Order #${order.orderNumber} placed successfully!`);
          setCurrentView('orders');
        }}
      />

      <PostProjectModal
        isOpen={showPostProjectModal}
        onClose={() => setShowPostProjectModal(false)}
        onSuccess={project => {
          showToast(`Project "${project.title}" published!`);
          setCurrentView('projects');
        }}
      />

      <SubmitProposalModal
        project={biddingProject}
        isOpen={showSubmitProposalModal}
        isPromotedSeller={Boolean(sellerProfile?.isPromoted)}
        onClose={() => setShowSubmitProposalModal(false)}
        onSuccess={proposal => {
          showToast('Proposal submitted successfully! The client will review your pitch.');
          setCurrentView('projects');
        }}
      />

      <DeliverWorkModal
        order={deliverOrder}
        isOpen={showDeliverModal}
        onClose={() => setShowDeliverModal(false)}
        onSuccess={updatedOrder => {
          showToast(`Work delivered for Order #${updatedOrder.orderNumber}! Client notified.`);
        }}
      />

      <ReviewModal
        order={reviewOrder}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={(review, avg) => {
          showToast(`Review submitted! Student rating updated to ${avg.toFixed(1)}.`);
        }}
      />

      <RazorpayModal
        plan={checkoutPlan}
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        onSuccess={newSub => {
          setSubscription(newSub);
          showToast('PRO Campus Star unlocked! All your listings are now Promoted.');
          if (sellerProfile) {
            setSellerProfile({ ...sellerProfile, isPromoted: true, subscriptionTier: 'premium' });
          }
        }}
      />
    </div>
  );
}
