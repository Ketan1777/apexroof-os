import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  LayoutDashboard,
  Eye,
  MessageSquare,
  Plus,
  Settings,
  Cloud,
} from 'lucide-react';

export type AppView = 'estimator' | 'dispatch' | 'customer_preview';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  smsCount: number;
  onOpenSmsDrawer: () => void;
  onNewQuote: () => void;
  onOpenSettings: () => void;
  currentPlanName: string;
  isCloudActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  smsCount,
  onOpenSmsDrawer,
  onNewQuote,
  onOpenSettings,
  currentPlanName,
  isCloudActive = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#091310]/90 backdrop-blur-md border-b border-emerald-950/60 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-white tracking-tight">ApexRoof OS</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Verified Contractor OS
                </span>
                {isCloudActive ? (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" /> Cloud Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" /> Local Storage
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Austin & Central Texas &bull; Crew 04</p>
            </div>
          </div>

          {/* Mobile quick actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              title="Settings & Billing"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSmsDrawer}
              className="p-2 rounded-xl bg-slate-900 border border-emerald-950/80 text-emerald-400 relative"
            >
              <MessageSquare className="w-4 h-4" />
              {smsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 text-slate-950 font-bold rounded-full text-[9px] flex items-center justify-center">
                  {smsCount}
                </span>
              )}
            </button>
            <button
              onClick={onNewQuote}
              className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80 w-full sm:w-auto justify-center">
          <button
            onClick={() => onSelectView('estimator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'estimator'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Field Estimator</span>
          </button>

          <button
            onClick={() => onSelectView('customer_preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'customer_preview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Client View</span>
          </button>

          <button
            onClick={() => onSelectView('dispatch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'dispatch'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dispatch & Map</span>
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
            title="Manage Plan & Stripe Keys"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Plan: {currentPlanName}</span>
          </button>

          <button
            onClick={onOpenSmsDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>SMS Stream</span>
            {smsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {smsCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewQuote}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ New Estimate</span>
          </button>
        </div>
      </div>
    </header>
  );
};
