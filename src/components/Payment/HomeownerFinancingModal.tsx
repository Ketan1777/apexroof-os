import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
  Lock,
  Percent
} from 'lucide-react';
import { Quote } from '../../types';

interface HomeownerFinancingModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

export const HomeownerFinancingModal: React.FC<HomeownerFinancingModalProps> = ({
  quote,
  isOpen,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'12mo_zero' | '60mo_low' | '120mo_ultra'>('60mo_low');
  const [applicantName, setApplicantName] = useState(quote.customer.name);
  const [applicantEmail, setApplicantEmail] = useState(quote.customer.email);
  const [applicantPhone, setApplicantPhone] = useState(quote.customer.phone);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const total = quote.total || 14000;

  // Monthly payment calculations
  const plan12Monthly = Math.round(total / 12);
  const plan60Monthly = Math.round((total * (1 + 0.0899 * 5)) / 60);
  const plan120Monthly = Math.round((total * (1 + 0.0999 * 10)) / 120);

  const handleSubmitPreApproval = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              Instant Homeowner Roof Financing
            </h3>
            <p className="text-xs text-slate-400">
              Low monthly payments &bull; $0 down &bull; Soft credit inquiry (no score impact)
            </p>
          </div>
        </div>

        {!isSubmitted ? (
          <div>
            {/* Financing Plan Tiers */}
            <div className="space-y-3 mb-6">
              {/* Plan 1 */}
              <div
                onClick={() => setSelectedPlan('60mo_low')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === '60mo_low'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Most Popular &bull; 60 Months Fixed
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Recommended
                    </span>
                  </div>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    ${plan60Monthly}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fixed 8.99% APR &bull; $0 Down &bull; No prepayment penalties
                </p>
              </div>

              {/* Plan 2 */}
              <div
                onClick={() => setSelectedPlan('12mo_zero')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === '12mo_zero'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    12 Months Same-As-Cash (0% APR)
                  </span>
                  <span className="text-lg font-black font-mono text-white">
                    ${plan12Monthly}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  0% Interest if paid in full within 12 months &bull; $0 Down
                </p>
              </div>

              {/* Plan 3 */}
              <div
                onClick={() => setSelectedPlan('120mo_ultra')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === '120mo_ultra'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    120 Months Ultra-Low Payment
                  </span>
                  <span className="text-lg font-black font-mono text-white">
                    ${plan120Monthly}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Lowest monthly payment &bull; 9.99% APR &bull; Immediate full roof replacement
                </p>
              </div>
            </div>

            {/* Quick Pre-Approval Form */}
            <form onSubmit={handleSubmitPreApproval} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Homeowner Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Mobile Phone (For Pre-Approval Code)
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Soft Credit Check Only:</strong> Checking pre-approval options will not impact your credit score or report.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Check Instant Pre-Approval</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Pre-Approval Code Sent!</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1">
                We sent a secure instant verification link to <strong>{applicantPhone}</strong> and{' '}
                <strong>{applicantEmail}</strong>. You can review your approved term offers and complete financing in under 2 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Selected Amount:</span>
                <span className="font-mono text-white font-bold">${Math.round(total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Payment:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ${selectedPlan === '60mo_low' ? plan60Monthly : selectedPlan === '12mo_zero' ? plan12Monthly : plan120Monthly}/mo
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Pre-Qualified (Tier 1)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Done & Return to Estimate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
