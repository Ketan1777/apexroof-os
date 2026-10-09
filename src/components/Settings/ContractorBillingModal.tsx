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
  Cloud,
  Database,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { testSupabaseConnection, resetSupabaseClient } from '../../lib/supabase';

export interface ContractorSettings {
  companyName: string;
  phone: string;
  email: string;
  currentPlan: 'starter' | 'pro' | 'unlimited';
  stripePublishableKey: string;
  stripePaymentLink: string;
  depositMode: 'flat_1000' | '10_percent' | '20_percent' | '30_percent';
  testMode: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

interface ContractorBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ContractorSettings;
  onSaveSettings: (settings: ContractorSettings) => void;
  onSyncAllQuotes?: () => Promise<number>;
}

const SQL_SCHEMA_SNIPPET = `-- 1. Create Quotes Table
create table if not exists public.quotes (
    id text primary key,
    job_id text,
    customer_name text,
    customer_phone text,
    customer_email text,
    customer_address text,
    customer_city text,
    customer_state text default 'TX',
    customer_zip text,
    technician_name text,
    ground_sqft numeric(10, 2),
    roof_pitch text default '6/12',
    waste_percent int default 12,
    stories int default 1,
    total_squares numeric(10, 2),
    bundle_count int,
    selected_tier text default 'better',
    subtotal numeric(12, 2),
    tax_amount numeric(12, 2),
    total_amount numeric(12, 2),
    deposit_percent int default 10,
    deposit_amount numeric(12, 2),
    status text default 'quoted',
    signature_data_url text,
    signed_by_name text,
    signed_at timestamptz,
    stripe_payment_intent_id text,
    deposit_paid_at timestamptz,
    addons jsonb default '[]'::jsonb,
    photos jsonb default '[]'::jsonb,
    payload jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS) & Allow Access
alter table public.quotes enable row level security;
drop policy if exists "Allow public select" on public.quotes;
drop policy if exists "Allow public insert" on public.quotes;
drop policy if exists "Allow public update" on public.quotes;
create policy "Allow public select" on public.quotes for select using (true);
create policy "Allow public insert" on public.quotes for insert with check (true);
create policy "Allow public update" on public.quotes for update using (true);

-- 3. Enable Realtime Sync
alter publication supabase_realtime add table public.quotes;`;

export const ContractorBillingModal: React.FC<ContractorBillingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSyncAllQuotes,
}) => {
  const [formData, setFormData] = useState<ContractorSettings>(() => ({
    ...settings,
    supabaseUrl: settings.supabaseUrl || localStorage.getItem('apex_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: settings.supabaseAnonKey || localStorage.getItem('apex_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }));

  const [saveToast, setSaveToast] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; tableReady?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncCount, setSyncCount] = useState<number | null>(null);

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
        'Supabase PostgreSQL Realtime Sync',
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

  const handleTestDatabase = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const result = await testSupabaseConnection(formData.supabaseUrl, formData.supabaseAnonKey);
      setDbTestResult(result);
      if (result.success) {
        localStorage.setItem('apex_supabase_url', (formData.supabaseUrl || '').trim());
        localStorage.setItem('apex_supabase_anon_key', (formData.supabaseAnonKey || '').trim());
        resetSupabaseClient();
      }
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: err?.message || 'Connection failed.',
      });
    } finally {
      setTestingDb(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncQuotes = async () => {
    if (!onSyncAllQuotes) return;
    setSyncingAll(true);
    try {
      const count = await onSyncAllQuotes();
      setSyncCount(count);
      setTimeout(() => setSyncCount(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.supabaseUrl) {
      localStorage.setItem('apex_supabase_url', formData.supabaseUrl.trim());
    }
    if (formData.supabaseAnonKey) {
      localStorage.setItem('apex_supabase_anon_key', formData.supabaseAnonKey.trim());
    }
    resetSupabaseClient();

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
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Settings & Cloud Sync
                </span>
                <span className="text-xs text-slate-400">PostgreSQL Database & Billing</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">Cloud Database, Billing & Real Payments</h3>
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
          {/* 1. Supabase PostgreSQL Cloud Database Sync */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-sky-950/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Supabase PostgreSQL Cloud Database</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      Realtime Live
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sync quotes, signatures & dispatch boards instantly across all estimator phones and laptops.
                  </p>
                </div>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                <span>Free Supabase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={formData.supabaseUrl || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  value={formData.supabaseAnonKey || ''}
                  onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={testingDb || !formData.supabaseUrl}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin' : ''}`} />
                <span>{testingDb ? 'Testing Connection...' : 'Test Cloud Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? '✓ SQL Copied to Clipboard!' : 'Copy 1-Click SQL Schema'}</span>
              </button>

              {onSyncAllQuotes && (
                <button
                  type="button"
                  onClick={handleSyncQuotes}
                  disabled={syncingAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
                  <span>
                    {syncingAll
                      ? 'Pushing Quotes...'
                      : syncCount !== null
                      ? `✓ Synced ${syncCount} Quotes!`
                      : 'Push All Local Quotes to Cloud'}
                  </span>
                </button>
              )}
            </div>

            {dbTestResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  dbTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {dbTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{dbTestResult.message}</p>
                  {dbTestResult.tableReady === false && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tip: Click &quot;Copy 1-Click SQL Schema&quot; above, go to Supabase Dashboard ➔ SQL Editor, paste and click Run!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Realistic SaaS Pricing Plans */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Contractor Operating System Plan
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
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                        {plan.badge}
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{plan.description}</p>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">${plan.price}</span>
                      <span className="text-xs text-slate-400">{plan.period}</span>
                    </div>

                    <ul className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Real Stripe Payment Integration */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real Homeowner Stripe Checkout
                </h4>
              </div>
              <a
                href="https://dashboard.stripe.com/payment-links"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline underline-offset-2"
              >
                <span>Stripe Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                  <span>Stripe Publishable Key (pk_live_... or pk_test_...)</span>
                </label>
                <input
                  type="text"
                  value={formData.stripePublishableKey}
                  onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                  placeholder="pk_test_51P9..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
                  <span>Direct Stripe Payment Link URL (Instant 1-Click Checkout)</span>
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
                  Clicking &quot;Pay Deposit via Stripe&quot; on customer proposals will open this payment page directly.
                </span>
              </div>
            </div>
          </div>

          {/* 4. Flexible Deposit Amount Policy */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Default Deposit Amount Policy
            </h4>
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
                <Check className="w-3.5 h-3.5" /> Configuration Saved!
              </span>
            ) : (
              'Changes immediately take effect across all mobile estimates'
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
