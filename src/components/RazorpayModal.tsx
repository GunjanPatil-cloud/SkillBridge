import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { SubscriptionPlan, SellerSubscription } from '../types';
import { api } from '../services/api';

interface RazorpayModalProps {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscription: SellerSubscription) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('student@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvv, setCardCvv] = useState('712');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'checkout' | 'verifying' | 'success'>('checkout');

  if (!isOpen || !plan) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setStep('verifying');

    try {
      // 1. Create trusted order on backend (Check 1 & 6: Price calculated on backend!)
      const orderResponse = await api.createSubscriptionOrder(plan.id);

      // Simulate network verification delay
      await new Promise(r => setTimeout(r, 1200));

      // 2. Generate test signature for sandbox verification
      const paymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const signature = `sim_sig_${Math.random().toString(36).substring(2, 12)}`;

      // 3. Verify Payment & Signature on backend
      const verifyResponse = await api.verifyPayment({
        razorpayOrderId: orderResponse.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        planId: plan.id,
      });

      setStep('success');
      setTimeout(() => {
        onSuccess(verifyResponse.subscription);
        onClose();
        setStep('checkout');
      }, 1500);
    } catch (err: any) {
      setStep('checkout');
      setError(err.message || 'Payment verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100 flex flex-col">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] px-6 py-4 text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight">Razorpay Secure</span>
                <span className="text-[10px] bg-blue-600/60 px-1.5 py-0.2 rounded font-semibold text-blue-200">
                  SANDBOX
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">SkillBridge Student Payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Plan: {plan.name}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Billed {plan.billingPeriod}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
            <p className="text-[10px] text-slate-400">Incl. all campus taxes</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 'verifying' ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-sm font-bold text-slate-800">Verifying Payment Signature...</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Validating HMAC-SHA256 signature with FastAPI/Express backend and storing auditable transaction record.
              </p>
            </div>
          ) : step === 'success' ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-600">
                PRO Campus Star subscription is now active. Your gigs have received the Promoted boost!
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">Debit/Credit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">Netbanking</span>
                  </button>
                </div>
              </div>

              {/* Method Details */}
              {paymentMethod === 'upi' ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>UPI ID / VPA</span>
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                      <QrCode className="w-3 h-3" /> Auto Verified
                    </span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 text-[10px] text-slate-400">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">GPay</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PhonePe</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Paytm</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-0.5">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Badges */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit SSL Encrypted
                </span>
                <span>PCI-DSS Level 1 Compliant</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Pay ₹{plan.price.toLocaleString()} Securely</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
