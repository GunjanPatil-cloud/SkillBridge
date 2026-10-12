import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order, Review } from '../types';
import { api } from '../services/api';

interface ReviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: Review, averageRating: number) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please provide at least 5 characters in your review feedback.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.submitReview(order.id, {
        rating,
        comment: comment.trim(),
      });
      onSuccess(res.review, res.averageRating);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Review {order.sellerName}</h2>
            <p className="text-xs text-slate-400">Order #{order.orderNumber}</p>
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

          <div className="text-center py-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Rate your experience with this student developer
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-600 mt-1">
              {rating === 5 && 'Outstanding Work (5/5)'}
              {rating === 4 && 'Great Experience (4/5)'}
              {rating === 3 && 'Met Requirements (3/5)'}
              {rating === 2 && 'Needs Improvement (2/5)'}
              {rating === 1 && 'Unsatisfactory (1/5)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Comments <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you like about the deliverable? Was the communication clear? Would you recommend them to other campus buyers?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your verified review will be displayed on {order.sellerName}'s public profile.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              {loading ? 'Submitting...' : 'Post Public Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
