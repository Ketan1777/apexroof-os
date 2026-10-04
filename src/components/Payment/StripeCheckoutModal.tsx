import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, X, Building, Loader2, Sparkles, Lock } from 'lucide-react';
import { Quote } from '../../types';

interface StripeCheckoutModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentIntentId: string, method: string) => void;
  stripePublishableKey?: string;
  stripePaymentLink?: string;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  quote,
  isOpen,
  onClose,
  onPaymentSuccess,
  stripePublishableKey,
  stripePaymentLink,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'ach'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPaymentId, setLastPaymentId] = useState('');

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('921');
  const [zip, setZip] = useState(quote.customer.zip || '78759');

  if (!isOpen) return null;

  const handleSimulatePayment = (methodName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedId = `pi_${Math.random().toString(36).substring(2, 10).toUpperCase()}_secret_trk`;
      setLastPaymentId(generatedId);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onPaymentSuccess(generatedId, methodName);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-950/70 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Stripe Connect Escrow
                </span>
                <span className="text-xs text-slate-400">Quote #{quote.id}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Instant Roof Deposit Checkout</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Deposit Successfully Captured!</h4>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Payment of <span className="text-white font-bold">${quote.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> processed securely via Stripe.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 inline-block">
                Transaction ID: {lastPaymentId}
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> SMS confirmation & crew schedule dispatched to homeowner
              </p>
            </div>
          ) : (
            <>
              {/* Deposit Summary Card */}
              <div className="bg-slate-950/80 border border-emerald-950/80 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Total Project Value</span>
                  <span className="text-sm font-semibold text-slate-200">${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                      Required Materials Deposit ({quote.depositPercent}%)
                    </span>
                    <span className="text-[11px] text-slate-500">Locks in shingle delivery & crew schedule</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">
                      ${quote.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {stripePaymentLink && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-white block">Real Stripe Checkout Connected</span>
                    <span className="text-[11px] text-emerald-300">Opens your direct Stripe-hosted page</span>
                  </div>
                  <a
                    href={stripePaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                    Open Live Stripe
                  </a>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  Credit / Debit
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base font-bold leading-none mb-1"> Pay</span>
                  Apple / Google
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ach')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    paymentMethod === 'ach'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building className="w-4 h-4 mb-1" />
                  ACH Bank Transfer
                </button>
              </div>

              {/* Payment Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5 opacity-70">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400">VISA</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/30 text-red-400">MC</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Exp Date</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">CVC / Security</label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Billing Postal Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'apple_pay' && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    Use Face ID or Touch ID to pay instantly on iPad, iPhone, or MacBook.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('Apple Pay')}
                    className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
                  >
                    <span>Pay with</span>
                    <span className="text-lg font-bold">Pay</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'ach' && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" /> Zero Processing Fees on Large Balances
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect instantly with Plaid or enter Routing/Account numbers. Ideal for balances over $10,000.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSimulatePayment('ACH Plaid')}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Building className="w-4 h-4 text-emerald-400" /> Connect Bank Account via Plaid
                  </button>
                </div>
              )}

              {/* Action Button */}
              {paymentMethod === 'card' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSimulatePayment('Credit Card')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authorizing via Stripe...
                    </>
                  ) : (
                    <>
                      Charge Deposit of ${quote.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  )}
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted &bull; Direct Contractor Stripe Escrow</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
