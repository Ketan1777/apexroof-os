import React from 'react';
import { MessageSquare, Phone, X, CheckCheck, Clock } from 'lucide-react';
import { SmsMessage } from '../../types';

interface SmsNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: SmsMessage[];
}

export const SmsNotificationDrawer: React.FC<SmsNotificationDrawerProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Automated Client SMS Stream
              </h3>
              <p className="text-xs text-slate-400">Twilio / SMS Gateway Outbox Simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No client SMS triggers sent yet.
            </div>
          ) : (
            messages.map((sms) => (
              <div
                key={sms.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Delivered
                    </span>
                    <span className="text-xs font-bold text-white">{sms.recipientName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sms.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#0a1712] p-3 rounded-xl border border-emerald-950/80 font-sans">
                  {sms.body}
                </p>

                <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> To: {sms.to}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium">
                    <CheckCheck className="w-3 h-3 text-emerald-400" /> Read by Customer
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-center">
          <p className="text-[11px] text-slate-400">
            Automated SMS triggers fire on technician dispatch, estimate completion, and Stripe payment webhooks.
          </p>
        </div>
      </div>
    </div>
  );
};
