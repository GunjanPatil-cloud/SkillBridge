import React from 'react';
import {
  X,
  Star,
  Clock,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Gig, Review } from '../types';

interface GigDetailsModalProps {
  gig: Gig | null;
  reviews: Review[];
  isOpen: boolean;
  onClose: () => void;
  onOrderClick: (gig: Gig) => void;
}

export const GigDetailsModal: React.FC<GigDetailsModalProps> = ({
  gig,
  reviews,
  isOpen,
  onClose,
  onOrderClick,
}) => {
  if (!isOpen || !gig) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {gig.categoryId.toUpperCase()}
            </span>
            {gig.isPromoted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-600" /> Promoted Listing
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Seller Overview */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {gig.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <img
                  src={gig.sellerAvatar}
                  alt={gig.sellerName}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                />
                <span className="font-bold text-slate-900">{gig.sellerName}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{gig.sellerCollege}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{gig.sellerRating.toFixed(1)}</span>
                <span className="text-slate-400">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Cover Image & Quick Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 shadow-xs">
                <img
                  src={gig.coverImage}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Service Overview</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {gig.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Skills & Deliverables
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {gig.tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Order Card */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 h-fit">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Standard Package
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    ₹{gig.price.toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4">
                  Full student deliverable with source files and revision support.
                </p>

                <div className="space-y-2 text-xs text-slate-700 border-t border-emerald-200/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>
                      <strong>{gig.deliveryDays} Days</strong> Delivery Time
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-emerald-700" />
                    <span>
                      <strong>{gig.revisions} Revisions</strong> Included
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Safe Campus Milestone Release</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOrderClick(gig)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Order Gig for ₹{gig.price.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Verified student escrow: funds released only upon completed delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Verified Buyer Reviews</span>
                <span className="px-2 py-0.5 text-xs bg-slate-100 rounded-full font-semibold text-slate-600">
                  {reviews.length}
                </span>
              </h3>
              <div className="text-xs text-slate-500">
                Reviews strictly restricted to completed transactions
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl text-center">
                No reviews yet for this student seller. Place an order to be the first!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.buyerAvatar}
                          alt={r.buyerName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-800">{r.buyerName}</span>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{r.comment}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified completed transaction
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
