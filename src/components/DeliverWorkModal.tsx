import React, { useState } from 'react';
import { X, CheckCircle2, Upload, AlertCircle, Link } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

interface DeliverWorkModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const DeliverWorkModal: React.FC<DeliverWorkModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [deliveryNote, setDeliveryNote] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryNote.trim() || deliveryNote.trim().length < 10) {
      setError('Please provide at least 10 characters detailing what was completed.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.deliverOrder(order.id, {
        deliveryNote: deliveryNote.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      onSuccess(res.order);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit delivery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-base font-bold">Deliver Work to Buyer</h2>
              <p className="text-xs text-emerald-100">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery Summary & Notes <span className="text-emerald-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what you built, setup instructions, credentials, or how to test your submission..."
              value={deliveryNote}
              onChange={e => setDeliveryNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              Deliverables Link (GitHub, Google Drive, Figma, or Preview URL)
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/project or https://drive.google.com/..."
              value={attachmentUrl}
              onChange={e => setAttachmentUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            Once submitted, your buyer will be notified and given the option to approve and release your earnings of <strong>₹{order.amount.toLocaleString()}</strong>.
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Send Delivery to Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
