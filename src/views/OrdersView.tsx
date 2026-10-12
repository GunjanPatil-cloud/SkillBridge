import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Send,
  FileText,
  User,
} from 'lucide-react';
import { Order, Review, User as UserType } from '../types';
import { api } from '../services/api';

interface OrdersViewProps {
  currentUser: UserType | null;
  onOpenDeliverModal: (order: Order) => void;
  onOpenReviewModal: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  currentUser,
  onOpenDeliverModal,
  onOpenReviewModal,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'delivered' | 'completed'>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isSeller = currentUser?.activeRole === 'seller';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders(isSeller ? 'seller' : 'buyer');
      setOrders(res.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser, isSeller]);

  const handleApproveDelivery = async (orderId: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, 'completed');
      setActionSuccess('Order approved! Student earnings released.');
      fetchOrders();
      // Prompt review modal
      onOpenReviewModal(res.order);
    } catch (err: any) {
      alert(err.message || 'Failed to approve order.');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {isSeller ? 'Client Engagements & Deliveries' : 'My Orders & Task Deliverables'}
          </h1>
          <p className="text-xs text-slate-500">
            {isSeller
              ? 'Fulfill orders and deliver student work for client review'
              : 'Track active gigs, review deliverables, release payments, and leave feedback'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'completed', label: 'Completed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === f.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isSeller
              ? 'When buyers purchase your gig or accept your project proposal, orders will appear here.'
              : 'Browse student services or post a project to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isBuyer = currentUser?.id === order.buyerId;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    <h3 className="text-base font-bold text-slate-900">{order.title}</h3>
                    <p className="text-xs text-slate-500">
                      {isBuyer ? (
                        <>
                          Student Seller: <strong>{order.sellerName}</strong>
                        </>
                      ) : (
                        <>
                          Client Buyer: <strong>{order.buyerName}</strong>
                        </>
                      )}{' '}
                      • Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900">₹{order.amount.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400">{order.deliveryDays} Days Turnaround</p>
                  </div>
                </div>

                {/* Requirements Brief */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block">
                    Scope & Instructions
                  </span>
                  <p className="leading-relaxed">{order.requirements}</p>
                </div>

                {/* Delivery Box (if delivered or completed) */}
                {order.deliveryNote && (
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Deliverables from {order.sellerName}
                      </span>
                      {order.deliveredAt && (
                        <span className="text-[11px] text-slate-500">
                          Delivered {new Date(order.deliveredAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-lg border border-emerald-100">
                      {order.deliveryNote}
                    </p>

                    {order.deliveryAttachmentUrl && (
                      <a
                        href={order.deliveryAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Deliverable Preview / Repository</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Protected student escrow milestone</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Seller action */}
                    {!isBuyer && order.status === 'in_progress' && (
                      <button
                        onClick={() => onOpenDeliverModal(order)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Deliver Work
                      </button>
                    )}

                    {/* Buyer actions */}
                    {isBuyer && order.status === 'delivered' && (
                      <button
                        onClick={() => handleApproveDelivery(order.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Delivery & Release Payment</span>
                      </button>
                    )}

                    {isBuyer && order.status === 'completed' && (
                      <button
                        onClick={() => onOpenReviewModal(order)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Leave Verified Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
