import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, X, AlertCircle, KeyRound, CheckCircle2, Key, RefreshCw } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
  onPinSet?: (newPin: string) => void;
  onResetViaPassword?: () => void;
  title?: string;
  description?: string;
}

type Mode = 'verify' | 'first_time_create' | 'first_time_confirm' | 'change_verify_old' | 'change_create_new' | 'change_confirm_new';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
  onPinSet,
  onResetViaPassword,
  title,
  description,
}) => {
  const isFirstTime = !correctPin;
  const [mode, setMode] = useState<Mode>(isFirstTime ? 'first_time_create' : 'verify');
  const [pin, setPin] = useState('');
  const [tempNewPin, setTempNewPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setTempNewPin('');
      setError(false);
      setErrorMessage('');
      setSuccessMessage('');
      setMode(!correctPin ? 'first_time_create' : 'verify');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, correctPin]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        processPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const processPin = (candidatePin: string) => {
    // 1. First-time setup: Step 1 (create)
    if (mode === 'first_time_create') {
      setTempNewPin(candidatePin);
      setPin('');
      setMode('first_time_confirm');
      return;
    }

    // 2. First-time setup: Step 2 (confirm)
    if (mode === 'first_time_confirm') {
      if (candidatePin === tempNewPin) {
        if (onPinSet) onPinSet(candidatePin);
        setSuccessMessage('Private Security PIN successfully created!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        setError(true);
        setErrorMessage('PINs do not match. Please choose again.');
        setPin('');
        setTempNewPin('');
        setMode('first_time_create');
      }
      return;
    }

    // 3. Changing PIN: Step 1 (Verify old PIN)
    if (mode === 'change_verify_old') {
      if (candidatePin === correctPin) {
        setPin('');
        setMode('change_create_new');
      } else {
        setError(true);
        setErrorMessage('Current PIN is incorrect. Cannot change.');
        setTimeout(() => setPin(''), 600);
      }
      return;
    }

    // 4. Changing PIN: Step 2 (Enter new PIN)
    if (mode === 'change_create_new') {
      setTempNewPin(candidatePin);
      setPin('');
      setMode('change_confirm_new');
      return;
    }

    // 5. Changing PIN: Step 3 (Confirm new PIN)
    if (mode === 'change_confirm_new') {
      if (candidatePin === tempNewPin) {
        if (onPinSet) onPinSet(candidatePin);
        setSuccessMessage('Security PIN successfully updated!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setError(true);
        setErrorMessage('New PINs do not match. Please try again.');
        setPin('');
        setTempNewPin('');
        setMode('change_create_new');
      }
      return;
    }

    // 6. Normal Verification (Exact match only)
    if (candidatePin === correctPin) {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setErrorMessage('Incorrect Security PIN. Access denied.');
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  const getHeaderInfo = () => {
    switch (mode) {
      case 'first_time_create':
        return {
          title: 'Create Your Secret 4-Digit PIN',
          badge: 'First-Time Setup',
          desc: 'Choose a private 4-digit PIN to lock your settings, database, and Stripe credentials so only you can access them.',
        };
      case 'first_time_confirm':
        return {
          title: 'Confirm Your Secret PIN',
          badge: 'Confirmation',
          desc: 'Re-enter the same 4-digit PIN to confirm and lock your account.',
        };
      case 'change_verify_old':
        return {
          title: 'Enter Current Security PIN',
          badge: 'Security Verification',
          desc: 'Enter your existing 4-digit PIN before creating a new one.',
        };
      case 'change_create_new':
        return {
          title: 'Enter New 4-Digit PIN',
          badge: 'Change PIN',
          desc: 'Choose your new private 4-digit PIN.',
        };
      case 'change_confirm_new':
        return {
          title: 'Confirm New 4-Digit PIN',
          badge: 'Confirm Change',
          desc: 'Re-enter your new 4-digit PIN to finalize the change.',
        };
      case 'verify':
      default:
        return {
          title: title || 'Owner Authorization Required',
          badge: 'Owner Protected',
          desc: description || 'Enter your private 4-digit Security PIN to access company settings, database keys, and Stripe.',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {headerInfo.title}
              </h3>
              <p className="text-[11px] text-slate-400">{headerInfo.badge}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {headerInfo.desc}
          </p>

          {/* Hidden physical keyboard input */}
          <form onSubmit={(e) => { e.preventDefault(); if (pin.length === 4) processPin(pin); }}>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
                setError(false);
                if (val.length === 4) {
                  processPin(val);
                }
              }}
              className="sr-only"
              autoFocus
            />
          </form>

          {/* 4-Digit Display */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pin.length > idx;
              return (
                <div
                  key={idx}
                  onClick={() => inputRef.current?.focus()}
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono transition-all border cursor-pointer ${
                    hasDigit
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20 scale-105'
                      : error
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {hasDigit ? '●' : '•'}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Number Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 active:bg-emerald-500/20 active:text-emerald-300 text-white font-bold text-base border border-slate-800/80 transition-colors shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 font-medium text-xs border border-slate-800/80 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 active:bg-emerald-500/20 text-white font-bold text-base border border-slate-800/80 transition-colors shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 font-medium text-xs border border-slate-800/80 transition-colors"
            >
              ⌫
            </button>
          </div>

          {/* Mode Switchers: Change PIN & Forgot PIN */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {mode === 'verify' && (
              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPin('');
                    setError(false);
                    setErrorMessage('');
                    setMode('change_verify_old');
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change PIN</span>
                </button>

                {onResetViaPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onResetViaPassword();
                    }}
                    className="text-slate-400 hover:text-slate-200 underline underline-offset-2 flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>Reset with Password</span>
                  </button>
                )}
              </div>
            )}

            {mode.startsWith('change_') && (
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setTempNewPin('');
                  setError(false);
                  setErrorMessage('');
                  setMode('verify');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
              >
                Cancel PIN Change
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};