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
  User,
  Users,
  Briefcase,
  Receipt,
  Lock,
  Unlock,
} from 'lucide-react';

export type AppView = 'crm' | 'estimator' | 'jobs' | 'invoices' | 'dispatch' | 'customer_preview';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  smsCount: number;
  onOpenSmsDrawer: () => void;
  onNewQuote: () => void;
  onOpenSettings: () => void;
  currentPlanName: string;
  isCloudActive?: boolean;
  currentUserEmail?: string | null;
  onOpenAuth: () => void;
  isAdminUnlocked?: boolean;
  onLockAdmin?: () => void;
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
  currentUserEmail,
  onOpenAuth,
  isAdminUnlocked = false,
  onLockAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#08130f]/95 backdrop-blur-md border-b border-emerald-950/60 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none whitespace-nowrap">
                ApexRoof OS
              </h1>
              {isCloudActive ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                  <Cloud className="w-2.5 h-2.5" /> Local
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
              Austin, TX &bull; Roofing ERP Suite
            </p>
          </div>
        </div>

        {/* Desktop View Switcher Pill - 6 Modules */}
        <nav className="hidden xl:flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSelectView('crm')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'crm'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CRM & Leads</span>
          </button>

          <button
            onClick={() => onSelectView('estimator')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'estimator'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Estimator</span>
          </button>

          <button
            onClick={() => onSelectView('jobs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Lifecycle</span>
          </button>

          <button
            onClick={() => onSelectView('invoices')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'invoices'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => onSelectView('dispatch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'dispatch'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dispatch & Crew</span>
          </button>

          <button
            onClick={() => onSelectView('customer_preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentView === 'customer_preview'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Proposal</span>
          </button>
        </nav>

        {/* Right Action Icons & New Quote Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenAuth}
            className={`flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs transition-all ${
              currentUserEmail
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 font-medium'
                : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-white border-emerald-500/40 font-bold shadow-sm shadow-emerald-500/10'
            }`}
            title={currentUserEmail ? `Active Owner Account: ${currentUserEmail}` : 'Owner Login / Sign Up (Protect Database & Stripe)'}
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline ml-1.5">
              {currentUserEmail ? currentUserEmail.split('@')[0] : 'Sign In / Sign Up'}
            </span>
          </button>

          {currentUserEmail && (
            <>
              <button
                onClick={onOpenSettings}
                className={`flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isAdminUnlocked
                    ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
                title={isAdminUnlocked ? "Company Settings & Pricing (Admin Active)" : "Settings (Locked - PIN Required)"}
              >
                {isAdminUnlocked ? (
                  <Settings className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
                <span className="hidden md:inline ml-1.5">
                  {isAdminUnlocked ? 'Settings' : 'Locked'}
                </span>
              </button>

              {isAdminUnlocked && onLockAdmin && (
                <button
                  onClick={onLockAdmin}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs transition-all"
                  title="Lock Admin Mode (Protect from Homeowners)"
                >
                  <Lock className="w-4 h-4 text-rose-400" />
                </button>
              )}
            </>
          )}

          <button
            onClick={onOpenSmsDrawer}
            className="relative flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
            title="SMS Stream Drawer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline ml-1.5">SMS Log</span>
            {smsCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:ml-1.5 w-4 h-4 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-emerald-500/30 flex items-center justify-center">
                {smsCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewQuote}
            className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">New Quote</span>
          </button>
        </div>
      </div>

      {/* Symmetrical Mobile & Tablet View Switcher - 6 items */}
      <div className="xl:hidden mt-2 pt-2 border-t border-slate-800/60 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1 p-1 bg-slate-900/95 rounded-xl border border-slate-800/80 min-w-max text-center">
          <button
            onClick={() => onSelectView('crm')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'crm'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>CRM</span>
          </button>

          <button
            onClick={() => onSelectView('estimator')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'estimator'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Estimator</span>
          </button>

          <button
            onClick={() => onSelectView('jobs')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Jobs</span>
          </button>

          <button
            onClick={() => onSelectView('invoices')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'invoices'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => onSelectView('dispatch')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'dispatch'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dispatch</span>
          </button>

          <button
            onClick={() => onSelectView('customer_preview')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              currentView === 'customer_preview'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Proposal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
