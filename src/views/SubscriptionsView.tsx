import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Crown,
  Zap,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Calendar,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { SubscriptionPlan, SellerSubscription } from '../types';
import { api } from '../services/api';

interface SubscriptionsViewProps {
  currentSubscription: SellerSubscription | null;
  onOpenRazorpay: (plan: SubscriptionPlan) => void;
  onSubscriptionUpdated: (sub: SellerSubscription) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  currentSubscription,
  onOpenRazorpay,
  onSubscriptionUpdated,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const isPro = currentSubscription?.planId.includes('premium') && currentSubscription?.status === 'active';

  const fetchPlansAndSub = async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getCurrentSubscription(),
      ]);
      setPlans(plansRes.plans);
      setHistory(currentRes.history || []);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansAndSub();
  }, [currentSubscription]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel subscription auto-renewal?')) return;
    setCancelling(true);
    try {
      const res = await api.cancelSubscription();
      onSubscriptionUpdated(res.subscription);
      setCancelMessage(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Title & Headline */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Seller Reach & Discovery Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Supercharge Your Campus Reach
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Help more campus buyers discover your skills. Transparent plans, boosted search visibility,
          and enhanced listing limits with fair-ranking integrity.
        </p>
      </div>

      {cancelMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>{cancelMessage}</span>
          </div>
          <button onClick={() => setCancelMessage(null)} className="text-amber-800 font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Active Subscription Status Card (if user has active PRO) */}
      {isPro && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-lg">
                <Crown className="w-5 h-5 text-amber-200 fill-amber-200" />
              </span>
              <h2 className="text-lg font-bold">{currentSubscription?.planName} Active</h2>
              <span className="text-[10px] bg-white text-slate-900 font-bold px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-amber-100">
              Current billing period ends:{' '}
              <strong>
                {new Date(currentSubscription!.currentPeriodEnd).toLocaleDateString()}
              </strong>
            </p>
            {currentSubscription?.cancelAtPeriodEnd && (
              <p className="text-xs text-amber-200 italic">
                Renewal cancelled. Benefits will expire at the end of the billing cycle.
              </p>
            )}
          </div>

          {!currentSubscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Auto-Renewal'}
            </button>
          )}
        </div>
      )}

      {/* Pricing Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* FREE PLAN */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Starter Student
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Free Student</h3>
              <p className="text-xs text-slate-500 mt-1">
                Everything you need to start offering student services on campus.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Up to <strong>3 Active Gigs</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard Marketplace Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Student Escrow Payment Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic Impression & View Stats</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="w-full py-2.5 block text-center text-xs font-bold text-slate-500 bg-slate-100 rounded-xl">
              Default Included Plan
            </span>
          </div>
        </div>

        {/* PRO MONTHLY PLAN */}
        <div className="relative bg-white rounded-3xl border-2 border-emerald-500 p-6 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-white" /> Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                PRO Campus Star
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">PRO Monthly</h3>
              <p className="text-xs text-slate-500 mt-1">
                Boosted visibility, priority bidding, and elevated placement.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹499</span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>10 Active Gigs</strong> (vs 3 on Free)</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Promoted Badge</strong> on All Listings</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-emerald-900">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>3x Boosted Placement</strong> in Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority Proposal Placement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Conversion Funnel Analytics</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isPro && currentSubscription?.planId === 'premium_monthly' ? (
              <span className="w-full py-2.5 block text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl">
                Current Active Plan
              </span>
            ) : (
              <button
                onClick={() => {
                  const p = plans.find(x => x.id === 'premium_monthly');
                  if (p) onOpenRazorpay(p);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade with Razorpay (₹499)</span>
              </button>
            )}
          </div>
        </div>

        {/* PRO YEARLY PLAN */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Best Value Campus Pass
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">PRO Annual Saver</h3>
              <p className="text-xs text-slate-500 mt-1">
                Save 33% over monthly billing for continuous year-round client reach.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹3,999</span>
              <span className="text-xs text-slate-400">/ year (₹333/mo)</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>25 Active Gigs</strong> Allowed</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Permanent <strong>PRO Campus Star</strong> Badge</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3.5x Priority Search Placement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Featured Hero Carousel Placement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Certificate of Top Student Freelancer</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isPro && currentSubscription?.planId === 'premium_yearly' ? (
              <span className="w-full py-2.5 block text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl">
                Current Active Plan
              </span>
            ) : (
              <button
                onClick={() => {
                  const p = plans.find(x => x.id === 'premium_yearly');
                  if (p) onOpenRazorpay(p);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Subscribe Annual (₹3,999)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fair Ranking Constitution & Disclaimer (Section 3 Requirement) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          SkillBridge Fair Ranking & Market Integrity Standards
        </h4>
        <p className="leading-relaxed">
          <strong>Promoted Placement Disclosure:</strong> All paid visibility placements are clearly
          labeled with a "Promoted" badge on search results, category pages, and bidding lists. Paid
          promotion increases discovery frequency but never overrides organic relevance or bypasses
          platform quality guidelines.
        </p>
        <p className="leading-relaxed">
          <strong>No Guaranteed Earnings Disclaimer:</strong> A subscription does not guarantee orders,
          clients, or monetary earnings. Client hire decisions remain strictly at the discretion of the
          buyer based on portfolio quality, responsiveness, and communication.
        </p>
        <p className="leading-relaxed">
          <strong>Payment Security:</strong> Orders and cryptographic HMAC-SHA256 signatures are
          generated and verified exclusively on the backend server.
        </p>
      </div>

      {/* Billing & Invoice History */}
      {history.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Payment & Invoice History</h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Razorpay Reference</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-700 capitalize">
                        {item.planId.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{item.amount}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {item.razorpayPaymentId || item.razorpayOrderId}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
