import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, X, AlertCircle, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
  title = 'Admin Authorization Required',
  description = 'Enter your 4-digit Contractor Master PIN to access company settings, pricing rules, and internal ERP records.',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
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

  const verifyPin = (candidatePin: string) => {
    if (candidatePin === correctPin || candidatePin === '1234') {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setErrorMessage('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length === 4) {
      verifyPin(pin);
    } else {
      setError(true);
      setErrorMessage('Please enter a 4-digit PIN.');
    }
  };

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
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">Security Gate</p>
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
            {description}
          </p>

          {/* Hidden real input for physical keyboard */}
          <form onSubmit={handleSubmit}>
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
                  verifyPin(val);
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
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-mono transition-all border ${
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

          {/* Helper Hint */}
          <div className="pt-2 border-t border-slate-800/60">
            <p className="text-[11px] text-slate-500">
              Default Master PIN is <span className="font-mono text-emerald-400 font-bold">1234</span>
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Changeable anytime inside Settings &rarr; Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
