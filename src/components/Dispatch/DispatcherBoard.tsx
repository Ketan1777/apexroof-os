import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Send,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Phone,
  FileText,
  Navigation,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Quote, Technician, SmsMessage } from '../../types';

interface DispatcherBoardProps {
  quotes: Quote[];
  technicians: Technician[];
  onOpenQuote: (quote: Quote) => void;
  onSendSms: (sms: SmsMessage) => void;
}

export const DispatcherBoard: React.FC<DispatcherBoardProps> = ({
  quotes,
  technicians,
  onOpenQuote,
  onSendSms,
}) => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const totalPipeline = quotes.reduce((acc, q) => acc + q.total, 0);
  const totalDepositsCollected = quotes
    .filter((q) => q.status === 'deposit_paid' || q.status === 'in_progress' || q.status === 'completed')
    .reduce((acc, q) => acc + q.depositAmount, 0);

  const handleTriggerEnRouteSms = (tech: Technician, quote: Quote) => {
    const newSms: SmsMessage = {
      id: `sms_${Date.now()}`,
      to: quote.customer.phone,
      recipientName: quote.customer.name,
      body: `Apex Roofing: ${tech.name} (${tech.role}) is en route to ${quote.customer.address}. Live GPS ETA: 12 mins. Track: https://apexroof.app/track/${tech.id}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'en_route',
    };
    onSendSms(newSms);
  };

  const handleSendProposalSms = (quote: Quote) => {
    const newSms: SmsMessage = {
      id: `sms_${Date.now()}`,
      to: quote.customer.phone,
      recipientName: quote.customer.name,
      body: `Hi ${quote.customer.name}, your verified roof proposal #${quote.id} ($${Math.round(quote.total).toLocaleString()}) is ready to review & sign: https://apexroof.app/p/${quote.id}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'quote_sent',
    };
    onSendSms(newSms);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Executive Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Pipeline Value
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            ${Math.round(totalPipeline).toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +24% vs last week (Hail surge)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stripe Deposits Captured
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">
            ${Math.round(totalDepositsCollected).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Direct to Operating Account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Crews in Field
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">3 Techs / 2 Crews</h3>
          <p className="text-xs text-teal-400 mt-1">100% GPS location telemetry active</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quote-to-Close Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">67.4%</h3>
          <p className="text-xs text-emerald-400 mt-1">Driven by Good/Better/Best tiers</p>
        </div>
      </div>

      {/* Live Technician Map & GPS Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Live Crew Telemetry & GPS Dispatch
            </h3>
            <p className="text-xs text-slate-400">Real-time truck locations & transit status</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            GPS Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-emerald-950 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                      <p className="text-[11px] text-emerald-400 font-medium">{tech.role}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      tech.status === 'on_site'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : tech.status === 'en_route'
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tech.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{tech.currentLocation.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{tech.phone}</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-900 flex gap-2">
                <button
                  type="button"
                  onClick={() => quotes[0] && handleTriggerEnRouteSms(tech, quotes[0])}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Ping En Route SMS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Jobs & Quotes Pipeline Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Active Job Contracts & Quotes
            </h3>
            <p className="text-xs text-slate-400">Click any job to open field editor or send homeowner links</p>
          </div>
        </div>

        <div className="space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-emerald-950 transition-all cursor-pointer"
              onClick={() => onOpenQuote(q)}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0 mt-0.5">
                  #{q.id.split('-')[1]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{q.customer.name}</h4>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        q.status === 'deposit_paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : q.status === 'quoted'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-teal-500/20 text-teal-400'
                      }`}
                    >
                      {q.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{q.customer.address}, {q.customer.city}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {q.calculation.totalSquares} SQ &bull; Tier: {q.selectedTier.toUpperCase()} &bull; Assigned: {q.technician.name}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between w-full md:w-auto gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-left md:text-right">
                  <span className="text-base font-black text-white font-mono block">
                    ${Math.round(q.total).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Deposit: ${Math.round(q.depositAmount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendProposalSms(q)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                    title="Send Quote SMS Link"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenQuote(q)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    Open Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
