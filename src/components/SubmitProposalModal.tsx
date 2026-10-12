import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { Project, Proposal } from '../types';
import { api } from '../services/api';

interface SubmitProposalModalProps {
  project: Project | null;
  isOpen: boolean;
  isPromotedSeller: boolean;
  onClose: () => void;
  onSuccess: (proposal: Proposal) => void;
}

export const SubmitProposalModal: React.FC<SubmitProposalModalProps> = ({
  project,
  isOpen,
  isPromotedSeller,
  onClose,
  onSuccess,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  // Initialize default bid amount to project budget
  const initialBid = bidAmount || String(project.budget);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim() || coverLetter.trim().length < 20) {
      setError('Please write at least 20 characters explaining how you will execute this task.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.submitProposal(project.id, {
        bidAmount: parseInt(bidAmount || String(project.budget), 10),
        deliveryDays: parseInt(deliveryDays, 10) || project.deadlineDays,
        coverLetter: coverLetter.trim(),
      });
      onSuccess(res.proposal);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Submit Project Bid</h2>
            <p className="text-xs text-slate-400 truncate max-w-sm">{project.title}</p>
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

          {isPromotedSeller && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>PRO Seller Advantage:</strong> Your proposal will be highlighted with a priority badge for the buyer.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Bid (INR ₹) <span className="text-emerald-600">*</span>
              </label>
              <input
                type="number"
                min="100"
                step="50"
                required
                value={initialBid}
                onChange={e => setBidAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Client Budget: ₹{project.budget}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Turnaround (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={deliveryDays}
                onChange={e => setDeliveryDays(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Client Deadline: {project.deadlineDays}d</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proposal Cover Letter & Relevant Experience <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain why you are the best fit, link to similar code or design you completed in college, and outline your approach..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
