import React, { useState } from 'react';
import { Smartphone, Copy, Send, Check, X, ShieldCheck, ExternalLink, Phone, AlertCircle } from 'lucide-react';
import { SmsMessage } from '../../types';

interface SendSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  recipientName: string;
  defaultMessage: string;
  onSendCloudSms: (sms: SmsMessage) => void;
}

export const SendSmsModal: React.FC<SendSmsModalProps> = ({
  isOpen,
  onClose,
  phone,
  recipientName,
  defaultMessage,
  onSendCloudSms,
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [toPhone, setToPhone] = useState(phone);
  const [copied, setCopied] = useState(false);
  const [sentViaCloud, setSentViaCloud] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  if (!isOpen) return null;

  // Clean phone number — digits only
  const cleanPhone = toPhone.replace(/[^0-9]/g, '');
  const displayPhone = cleanPhone || phone.replace(/[^0-9]/g, '');

  // Native SMS — works on iOS & Android
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsHref = isIOS
    ? `sms:${displayPhone}&body=${encodeURIComponent(message)}`
    : `sms:${displayPhone}?body=${encodeURIComponent(message)}`;

  // WhatsApp direct — great for international / India numbers
  const whatsappHref = `https://wa.me/${displayPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloudSend = () => {
    const newSms: SmsMessage = {
      id: `sms_${Date.now()}`,
      to: toPhone || phone,
      recipientName,
      body: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'quote_sent',
    };
    onSendCloudSms(newSms);
    setSentViaCloud(true);
    setTimeout(() => {
      setSentViaCloud(false);
      onClose();
    }, 1800);
  };

  const handleWhatsApp = () => {
    window.open(whatsappHref, '_blank');
    // Also log the send
    const newSms: SmsMessage = {
      id: `sms_wa_${Date.now()}`,
      to: toPhone || phone,
      recipientName,
      body: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'quote_sent',
    };
    onSendCloudSms(newSms);
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 2500);
  };

  const phoneOk = displayPhone.length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Send Quote Link via SMS
              </h3>
              <p className="text-xs text-slate-400">
                To: <span className="text-white font-medium">{recipientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Editable Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recipient Phone Number</span>
              {!phoneOk && (
                <span className="text-amber-400 text-[10px] flex items-center gap-1 ml-auto">
                  <AlertCircle className="w-3 h-3" /> Enter at least 10 digits
                </span>
              )}
            </label>
            <input
              type="tel"
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="e.g. 8090351977 or (809) 035-1977"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm font-mono font-bold text-white focus:outline-none transition-colors ${
                phoneOk ? 'border-emerald-500/40 focus:border-emerald-500' : 'border-amber-500/40 focus:border-amber-400'
              }`}
            />
            {phoneOk && (
              <span className="text-[10px] text-emerald-400 mt-1 block flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready to send to +{displayPhone}
              </span>
            )}
          </div>

          {/* Message Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Text Message Body</span>
              <span className="text-[10px] text-slate-500">{message.length} characters</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* 1. Native SMS — opens iPhone/Android Messages app */}
            <a
              href={smsHref}
              onClick={() => {
                const newSms: SmsMessage = {
                  id: `sms_${Date.now()}`,
                  to: toPhone || phone,
                  recipientName,
                  body: message,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'quote_sent',
                };
                onSendCloudSms(newSms);
              }}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                phoneOk
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 Open in Phone Messages App (Free/Native)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* 2. WhatsApp — perfect for international numbers */}
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={!phoneOk}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                phoneOk
                  ? 'bg-[#075e54] hover:bg-[#0a7060] text-white shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="text-base leading-none">💬</span>
              <span>{whatsappSent ? '✓ WhatsApp Opened!' : 'Send via WhatsApp (India / International)'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 3. Copy Text */}
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              {/* 4. Log to SMS Drawer */}
              <button
                type="button"
                onClick={handleCloudSend}
                className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 text-emerald-300 border border-emerald-950/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {sentViaCloud ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{sentViaCloud ? '✓ Logged!' : 'Log to SMS Feed'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              For real Twilio auto-send: Add <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded text-[10px]">VITE_TWILIO_ACCOUNT_SID</code> in Settings → Cloud Config
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
