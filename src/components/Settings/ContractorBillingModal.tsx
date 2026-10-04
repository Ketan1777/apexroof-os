import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Check,
  Sparkles,
  X,
  Building,
  Key,
  ExternalLink,
  HelpCircle,
  Zap,
} from 'lucide-react';

export interface ContractorSettings {
  companyName: string;
  phone: string;
  email: string;
  currentPlan: 'starter' | 'pro' | 'unlimited';
  stripePublishableKey: string;
  stripePaymentLink: string;
  depositMode: 'flat_1000' | '10_percent' | '20_percent' | '30_percent';
  testMode: boolean;
}

interface ContractorBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ContractorSettings;
  onSaveSettings: (settings: ContractorSettings) => void;
}

export const ContractorBillingModal: React.FC<ContractorBillingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<ContractorSettings>(settings);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const PLANS = [
    {
      id: 'starter' as const,
      name: 'Solo Crew',
      price: 49,
      period: '/month',
      badge: 'Most Accessible',
      description: 'Perfect for independent roofers & 1-truck operators.',
      features: [
        '1 Active Estimator / Truck',
        'Unlimited Mobile Quotes & E-Signs',
        'Good / Better / Best 3-Tier Engine',
        'Native Mobile SMS Links (100% Free)',
        'Stripe Deposit Checkout (0.5% fee)',
      ],
    },
    {
      id: 'pro' as const,
      name: 'Pro Crew (Most Popular)',
      price: 129,
      period: '/month',
      badge: 'Best Value',
      highlight: true,
      description: 'For growing roofing companies with multiple estimators in the field.',
      features: [
        'Up to 5 Trucks / Crew Accounts',
        'Live GPS Crew Telemetry & Dispatch',
        'Automated Customer SMS Dispatch',
        'Damage Photo Inspection Logger',
        'Stripe Connect Escrow (0.3% fee)',
      ],
    },
    {
      id: 'unlimited' as const,
      name: 'Empire Scale',
      price: 249,
      period: '/month',
      badge: 'Commercial',
      description: 'For multi-crew operations running $2M+ annual volume.',
      features: [
        'Unlimited Trucks & Subcontractors',
        'Dedicated Phone Number & Twilio Routing',
        'Export to QuickBooks & AccuLynx',
        'Custom Material Supplier Price Lists',
        '0% Software Processing Fees',
      ],
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Settings & Billing
                </span>
                <span className="text-xs text-slate-400">Software Subscription & Stripe Setup</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Contractor Plan & Real Payment Keys</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Realistic SaaS Pricing Plans */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Select Your Contractor Software Plan
              </label>
              <span className="text-xs text-emerald-400 font-semibold">14-Day Free Trial Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLANS.map((plan) => {
                const isSelected = formData.currentPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, currentPlan: plan.id })}
                    className={`relative rounded-2xl p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-500/15 via-slate-900 to-slate-900 border-emerald-500 ring-1 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                              : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">{plan.description}</p>
                      <div className="text-xl font-black text-white font-mono mb-3">
                        ${plan.price}
                        <span className="text-xs font-normal text-slate-400">{plan.period}</span>
                      </div>
                      <ul className="space-y-1.5 border-t border-slate-800/80 pt-2 text-[11px] text-slate-300">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Real Stripe Payment Integration */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Stripe Connection (Collect Real Customer Money)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Mode:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, testMode: !formData.testMode })}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    formData.testMode
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {formData.testMode ? 'Stripe Test Keys' : 'Live Production'}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                  <span>Stripe Publishable Key (`pk_test_...` or `pk_live_...`)</span>
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    Get Stripe Keys <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="text"
                  value={formData.stripePublishableKey}
                  onChange={(e) =>
                    setFormData({ ...formData, stripePublishableKey: e.target.value })
                  }
                  placeholder="pk_live_51P..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                  <span>Direct Stripe Payment Link URL (Optional 1-Click Checkout)</span>
                  <span className="text-[11px] text-slate-500">e.g. buy.stripe.com/12345</span>
                </label>
                <input
                  type="text"
                  value={formData.stripePaymentLink}
                  onChange={(e) => setFormData({ ...formData, stripePaymentLink: e.target.value })}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  If set, clicking &quot;Pay Deposit via Stripe&quot; will immediately open your real Stripe payment page in a new window.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Flexible Deposit Policy Settings */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Default Deposit Amount Policy
            </h4>
            <p className="text-xs text-slate-400">
              High deposit percentages (30%+) can deter hesitant homeowners. You can set a lower earnest money deposit to close deals faster.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'flat_1000' as const, label: 'Flat $1,000 Lock', desc: 'Fastest driveway close' },
                { id: '10_percent' as const, label: '10% Booking Fee', desc: '~ $1,750 on avg' },
                { id: '20_percent' as const, label: '20% Material Order', desc: '~ $3,500 on avg' },
                { id: '30_percent' as const, label: '30% Standard Shingle', desc: 'Standard contract' },
              ].map((dep) => (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, depositMode: dep.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.depositMode === dep.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">{dep.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{dep.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            {saveToast ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            ) : (
              'Changes take effect across all field estimates'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
