import React, { useState } from 'react';
import { Smartphone, Copy, Send, Check, X, ShieldCheck, ExternalLink } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [sentViaCloud, setSentViaCloud] = useState(false);

  if (!isOpen) return null;

  // Clean phone number for tel/sms protocols
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  // Native SMS link format (works seamlessly on iOS Safari & Android Chrome)
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsHref = isIOS
    ? `sms:${cleanPhone}&body=${encodeURIComponent(message)}`
    : `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloudSend = () => {
    const newSms: SmsMessage = {
      id: `sms_${Date.now()}`,
      to: phone,
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
    }, 1200);
  };

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
                To: <span className="text-white font-medium">{recipientName}</span> ({phone})
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

        {/* Message Editor */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Text Message Preview</span>
              <span className="text-[10px] text-slate-500">{message.length} characters</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Action Grid */}
          <div className="space-y-2.5">
            {/* 1. Native Mobile SMS (₹0 Cost - Uses device carrier) */}
            <a
              href={smsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open Phone Messages App (100% Free / Native)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 2. Copy Text */}
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SMS Text'}</span>
              </button>

              {/* 3. Cloud / Twilio Send */}
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
                <span>{sentViaCloud ? 'Dispatched!' : 'Send via Cloud Gateway'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Opens directly in iMessage or Android Messages with link attached</span>
          </div>
        </div>
      </div>
    </div>
  );
};
