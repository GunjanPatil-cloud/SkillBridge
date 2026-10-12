import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  GraduationCap,
  Eye,
  MousePointer,
  AlertCircle,
  Crown,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SellerProfile, SellerSubscription, Gig, Order, User } from '../types';
import { api } from '../services/api';

interface SellerDashboardViewProps {
  currentUser: User | null;
  sellerProfile: SellerProfile | null;
  subscription: SellerSubscription | null;
  onOpenDeliverModal: (order: Order) => void;
  onOpenSubscriptions: () => void;
  onProfileUpdated: (profile: SellerProfile) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  currentUser,
  sellerProfile,
  subscription,
  onOpenDeliverModal,
  onOpenSubscriptions,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'profile'>('listings');
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGigModal, setShowCreateGigModal] = useState(false);
  const [newGigError, setNewGigError] = useState<string | null>(null);

  // New Gig form state
  const [gigTitle, setGigTitle] = useState('');
  const [gigCategory, setGigCategory] = useState('web-dev');
  const [gigPrice, setGigPrice] = useState('1200');
  const [gigDays, setGigDays] = useState('3');
  const [gigDesc, setGigDesc] = useState('');
  const [gigTags, setGigTags] = useState('React, Tailwind');
  const [creatingGig, setCreatingGig] = useState(false);

  // Profile Edit state
  const [editBio, setEditBio] = useState(sellerProfile?.bio || '');
  const [editRate, setEditRate] = useState(String(sellerProfile?.hourlyRate || 500));
  const [editPortfolio, setEditPortfolio] = useState(sellerProfile?.portfolioUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const isPro = subscription?.planId.includes('premium');
  const maxGigsAllowed = isPro ? 10 : 3;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gigsRes, ordersRes] = await Promise.all([
        api.getGigs(),
        api.getOrders('seller'),
      ]);
      const userGigs = gigsRes.gigs.filter(g => g.sellerId === currentUser?.id);
      setMyGigs(userGigs);
      setMyOrders(ordersRes.orders);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Total Earnings calculation
  const totalEarnings = myOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const totalImpressions = myGigs.reduce((sum, g) => sum + g.impressions, 0);
  const totalClicks = myGigs.reduce((sum, g) => sum + g.clicks, 0);

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewGigError(null);

    if (myGigs.length >= maxGigsAllowed) {
      setNewGigError(
        `Listing limit reached (${maxGigsAllowed} gigs max). Please upgrade to PRO Campus Star for more listings!`
      );
      return;
    }

    setCreatingGig(true);
    try {
      const res = await api.createGig({
        title: gigTitle,
        description: gigDesc,
        categoryId: gigCategory,
        price: parseInt(gigPrice, 10),
        deliveryDays: parseInt(gigDays, 10),
        tags: gigTags.split(',').map(t => t.trim()).filter(Boolean),
        coverImage:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
      });
      setMyGigs([...myGigs, res.gig]);
      setShowCreateGigModal(false);
      setGigTitle('');
      setGigDesc('');
    } catch (err: any) {
      setNewGigError(err.message || 'Failed to create gig.');
    } finally {
      setCreatingGig(false);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteGig(gigId);
      setMyGigs(myGigs.filter(g => g.id !== gigId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateSellerProfile({
        bio: editBio,
        hourlyRate: parseInt(editRate, 10) || 500,
        portfolioUrl: editPortfolio,
      });
      onProfileUpdated(res.sellerProfile);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Seller Header & Tier Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser?.fullName}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Student Seller
              </span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  PRO Star
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Free Plan
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{sellerProfile?.collegeName}</span>
              <span className="text-slate-300">•</span>
              <span>{sellerProfile?.major} (Grad '{(sellerProfile?.graduationYear || 2027)})</span>
            </p>
          </div>
        </div>

        {/* Upgrade / Reach CTA */}
        {!isPro ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3">
            <div>
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Boost Your Marketplace Reach
              </p>
              <p className="text-[11px] text-amber-700">
                Get 3x search boost, Promoted badges, and 10 listing slots for ₹499/mo.
              </p>
            </div>
            <button
              onClick={onOpenSubscriptions}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Upgrade to PRO
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>PRO Reach Active:</strong> All your listings receive high-visibility search boost.
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Net Earnings
          </span>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalEarnings.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Released to student account
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Orders Completed
          </span>
          <div className="text-2xl font-black text-slate-900">
            {myOrders.filter(o => o.status === 'completed').length}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {myOrders.filter(o => o.status === 'in_progress').length} currently active
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Search Impressions
          </span>
          <div className="text-2xl font-black text-slate-900">
            {totalImpressions.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <Eye className="w-3 h-3" /> {isPro ? '3x PRO Boosted' : 'Standard Organic'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Rating
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
            <span>{sellerProfile?.averageRating.toFixed(1) || '5.0'}</span>
            <span className="text-xs text-amber-500 font-bold">★</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Based on {sellerProfile?.ratingCount || 0} client reviews
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'listings'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Service Listings ({myGigs.length}/{maxGigsAllowed})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Client Orders ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'text-emerald-700 border-b-2 border-emerald-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Bio & Portfolio
        </button>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Campus Gigs</h2>
              <p className="text-xs text-slate-500">
                You have used {myGigs.length} of {maxGigsAllowed} permitted listing slots
              </p>
            </div>

            <button
              onClick={() => setShowCreateGigModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Gig</span>
            </button>
          </div>

          {myGigs.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No active listings</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first service listing to start receiving campus orders!
              </p>
              <button
                onClick={() => setShowCreateGigModal(true)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Create First Gig
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myGigs.map(gig => (
                <div
                  key={gig.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-100">
                    <img
                      src={gig.coverImage}
                      alt={gig.title}
                      className="w-full h-full object-cover"
                    />
                    {gig.isPromoted && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                        <Sparkles className="w-3 h-3 fill-slate-950" /> Promoted
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                      {gig.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>₹{gig.price.toLocaleString()}</span>
                      <span>{gig.deliveryDays} Days Delivery</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {gig.impressions} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3" /> {gig.clicks} Clicks
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteGig(gig.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLIENT ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Received Client Orders</h2>
            <span className="text-xs text-slate-500">{myOrders.length} Total</span>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No client orders yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Promote your profile or bid on project tasks to land your first client order!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'delivered'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{order.title}</h3>
                    <p className="text-xs text-slate-500">
                      Buyer: <strong>{order.buyerName}</strong> • Placed:{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                      <strong>Requirements:</strong> {order.requirements}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{order.amount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400">{order.deliveryDays} days turnaround</p>
                    </div>

                    {order.status === 'in_progress' && (
                      <button
                        onClick={() => onOpenDeliverModal(order)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Deliver Work Now
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
                        Awaiting Buyer Approval
                      </span>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed & Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900 mb-4">Edit Student Seller Profile</h2>

          {profileSaveSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio & Campus Experience
              </label>
              <textarea
                rows={3}
                required
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hourly Rate (INR ₹)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={editRate}
                onChange={e => setEditRate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Portfolio / GitHub URL
              </label>
              <input
                type="url"
                value={editPortfolio}
                onChange={e => setEditPortfolio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* CREATE GIG MODAL */}
      {showCreateGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">Create New Student Service</h2>
              <button
                onClick={() => setShowCreateGigModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGig} className="p-6 space-y-4">
              {newGigError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{newGigError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Title <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. I will build an MVP landing page with React and Tailwind"
                  value={gigTitle}
                  onChange={e => setGigTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={gigCategory}
                    onChange={e => setGigCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="web-dev">Web & Mobile Dev</option>
                    <option value="ai-data">AI & Data Science</option>
                    <option value="design">UI/UX & Graphics</option>
                    <option value="tutoring">Tutoring & Academic</option>
                    <option value="content">Content & Writing</option>
                    <option value="video">Video & Animation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (INR ₹) <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={gigPrice}
                    onChange={e => setGigPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={gigDays}
                    onChange={e => setGigDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="React, CSS, Responsive"
                    value={gigTags}
                    onChange={e => setGigTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Description & Scope <span className="text-emerald-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail your offerings, deliverables, and requirements..."
                  value={gigDesc}
                  onChange={e => setGigDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateGigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGig}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md cursor-pointer disabled:opacity-50"
                >
                  {creatingGig ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
