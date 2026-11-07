import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Building,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Eye,
  EyeOff,
  User,
  KeyRound,
  FileText,
  Sparkles,
} from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signOutUser } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string | null;
  onAuthSuccess: (email: string, companyName?: string) => void;
  onLogoutSuccess: () => void;
  isForcedGatekeeper?: boolean;
  onContinueAsDemo?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onAuthSuccess,
  onLogoutSuccess,
  isForcedGatekeeper = false,
  onContinueAsDemo,
}) => {
  // Tab state: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === 'signup') {
      if (!companyName.trim()) {
        setErrorMsg('Please enter your Roofing Company Name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'signup') {
        const { user, error } = await signUpWithEmail(email, password, companyName);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Account created successfully! Welcome aboard.');
          onAuthSuccess(user.email || email, companyName);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          setSuccessMsg('Signed in successfully! Access granted.');
          onAuthSuccess(user.email || email);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOutUser();
    onLogoutSuccess();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {currentUserEmail ? 'Contractor Account' : 'ApexRoof OS Security'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUserEmail ? 'Active Owner Session' : 'Protected Roofing ERP & Database'}
              </p>
            </div>
          </div>
          {!isForcedGatekeeper && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher (Prominent Sign In vs Sign Up Tabs) */}
        {!currentUserEmail && (
          <div className="p-3 bg-slate-950/90 border-b border-slate-800/80 shrink-0">
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 gap-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'signin'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'signup'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Account (Sign Up)</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {currentUserEmail ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Logged In Owner Account
                </span>
                <p className="text-sm font-semibold text-white break-all">{currentUserEmail}</p>
                <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Authenticated &bull; Full Access to Database & Stripe</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & Owner Isolation Active</span>
                </p>
                <p className="text-[11px]">
                  Your database credentials, Stripe keys, customer leads, and profit margins are encrypted and restricted to your account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'Signing out...' : 'Sign Out of Account'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Context Notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {activeTab === 'signin' ? 'Owner Authorization' : 'New Contractor Setup'}
                  </span>
                  <span>
                    {activeTab === 'signin'
                      ? 'Sign in to access your company database, Stripe checkout links, and CRM.'
                      : 'Create your account to secure your database and Stripe integration.'}
                  </span>
                </div>
              </div>

              {/* Sign Up Fields */}
              {activeTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company Legal Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Roofing & Restoration"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Owner / Primary Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State Roofing License # (Optional)</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. TX-R-88391"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Shared Fields: Email & Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contractor@roofing.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Error & Success Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : activeTab === 'signup'
                    ? 'Register & Create Account'
                    : 'Sign In to ApexRoof OS'}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Secure Notice */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  🔒 Protected by Owner Account &amp; Private Security PIN
                </p>
              </div>

              {/* Gatekeeper Demo Option */}
              {isForcedGatekeeper && onContinueAsDemo && (
                <div className="pt-3 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={onContinueAsDemo}
                    className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
                  >
                    Continue in Sandbox Demo Mode (Local Sample Data)
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
