import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { Gig, Order } from '../types';
import { api } from '../services/api';

interface OrderRequirementModalProps {
  gig: Gig | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const OrderRequirementModal: React.FC<OrderRequirementModalProps> = ({
  gig,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !gig) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requirements.trim().length < 10) {
      setError('Please provide at least 10 characters describing your project requirements.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.createOrder({
        gigId: gig.id,
        requirements: requirements.trim(),
      });
      onSuccess(res.order);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Start Order with {gig.sellerName}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[280px]">{gig.title}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-700" /> {gig.deliveryDays} Days
                </span>
                <span>Includes {gig.revisions} revisions</span>
              </div>
            </div>
            <div className="text-lg font-black text-slate-900">₹{gig.price.toLocaleString()}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Brief & Instructions <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your goals, requirements, specific links, colors, or deadlines for the student freelancer..."
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Escrow Protected: Funds are retained until you review and approve the final delivery.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting Order...' : `Confirm & Place Order (₹${gig.price})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
