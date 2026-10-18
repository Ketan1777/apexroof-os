import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Calculator,
  MessageSquare,
  CheckCircle2,
  X,
  FileCheck,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { Lead, LeadStage, LeadSource } from '../../types';

interface LeadPipelineViewProps {
  leads: Lead[];
  onUpdateLead: (updated: Lead) => void;
  onAddLead: (lead: Lead) => void;
  onConvertToQuote: (lead: Lead) => void;
}

const STAGES: { id: LeadStage; label: string; color: string; border: string; bg: string }[] = [
  { id: 'new', label: 'New Inbound', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'contacted', label: 'Contacted', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  { id: 'inspection_scheduled', label: 'Inspection Set', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'quote_sent', label: 'Quote Sent', color: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
  { id: 'negotiation', label: 'Negotiation', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'won', label: 'Won / Booked', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/15' },
];

export const LeadPipelineView: React.FC<LeadPipelineViewProps> = ({
  leads,
  onUpdateLead,
  onAddLead,
  onConvertToQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeLeadDetails, setActiveLeadDetails] = useState<Lead | null>(null);

  // New Lead form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Austin');
  const [newState, setNewState] = useState('TX');
  const [newZip, setNewZip] = useState('78759');
  const [newSource, setNewSource] = useState<LeadSource>('Google Search');
  const [newEstValue, setNewEstValue] = useState<number>(18500);
  const [newNotes, setNewNotes] = useState('');

  // Metrics
  const totalLeads = leads.length;
  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
  const wonLeads = leads.filter((l) => l.stage === 'won');
  const winRate = totalLeads > 0 ? Math.round((wonLeads.length / totalLeads) * 100) : 0;
  const avgDealSize = totalLeads > 0 ? Math.round(totalPipelineValue / totalLeads) : 0;

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesSource = sourceFilter === 'all' || lead.leadSource === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleStageChange = (lead: Lead, newStage: LeadStage) => {
    onUpdateLead({
      ...lead,
      stage: newStage,
    });
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newPhone.trim()) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      customerName: newCustomerName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || 'homeowner@austinhomes.org',
      address: newAddress.trim() || '3400 South Congress Ave',
      city: newCity.trim(),
      state: newState.trim(),
      zip: newZip.trim(),
      leadSource: newSource,
      dateReceived: new Date().toISOString().split('T')[0],
      assignedSalesperson: 'Marcus Vance',
      estimatedValue: Number(newEstValue) || 16000,
      nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      stage: 'new',
      notes: newNotes.trim() || 'Inbound inquiry from roofing lead form.',
    };

    onAddLead(newLead);
    setIsAddModalOpen(false);

    // Reset
    setNewCustomerName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                CRM & Sales Pipeline
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Lead Tracker
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage inbound leads, schedule inspections, and convert directly into roof quotes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Leads in Funnel
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {totalLeads}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Austin metropolitan area</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Pipeline Value
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ${totalPipelineValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Estimated gross contract revenue</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Proposal Close Rate
          </span>
          <span className="text-2xl font-black text-teal-300 font-mono mt-1 block">
            {winRate}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{wonLeads.length} deals closed & deposit locked</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Job Estimate
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            ${avgDealSize.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Across residential roofs</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by customer name, street address, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Lead Sources</option>
            <option value="Website">Website Form</option>
            <option value="Door-to-Door">Door-to-Door Canvass</option>
            <option value="Referral">Referral</option>
            <option value="Google Search">Google Search</option>
            <option value="Insurance Claim">Insurance Claim</option>
          </select>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const colLeads = filteredLeads.filter((l) => l.stage === col.id);
          const colValue = colLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

          return (
            <div
              key={col.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 flex flex-col min-w-[240px] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${col.id === 'won' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.border} ${col.bg} ${col.color}`}>
                  {colLeads.length}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-mono mb-2.5">
                ${colValue.toLocaleString()} total
              </div>

              {/* Lead Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-600 border border-dashed border-slate-800/70 rounded-xl">
                    No leads in this stage
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 hover:border-emerald-500/50 transition-all shadow-sm space-y-2 group cursor-pointer"
                      onClick={() => setActiveLeadDetails(lead)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {lead.customerName}
                        </h4>
                        <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                          ${(lead.estimatedValue / 1000).toFixed(1)}k
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <p className="flex items-center gap-1 truncate text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{lead.address}</span>
                        </p>
                        <p className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{lead.phone}</span>
                        </p>
                      </div>

                      {/* Source tag & follow-up */}
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-850">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {lead.leadSource}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {lead.nextFollowUpDate.slice(5)}
                        </span>
                      </div>

                      {/* Action: Convert to Roof Quote (Priority 1 Core Feature) */}
                      <div className="pt-1.5 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onConvertToQuote(lead)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                          title="Generate Roof Estimate directly with this customer data"
                        >
                          <Calculator className="w-3 h-3 text-emerald-400" />
                          <span>{lead.quoteId ? 'Open Estimate' : 'Convert to Quote'}</span>
                        </button>

                        {/* Stage quick dropdown */}
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead, e.target.value as LeadStage)}
                          className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded-lg px-1.5 py-1.5 focus:outline-none focus:border-emerald-500"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Inbound Roofing Lead</h3>
                <p className="text-xs text-slate-400">Capture homeowner information to start the sales pipeline</p>
              </div>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Customer / Homeowner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Jason & Lisa Taylor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Cell Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(512) 555-0144"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="homeowner@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Estimated Deal Value ($)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={newEstValue}
                    onChange={(e) => setNewEstValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="5104 Mesa Dr"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lead Source</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Google Search">Google Search (Organic / Maps)</option>
                  <option value="Door-to-Door">Door-to-Door Canvassing</option>
                  <option value="Referral">Referral / Word of Mouth</option>
                  <option value="Website">Website Contact Form</option>
                  <option value="Insurance Claim">Insurance Storm Restoration</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Notes / Storm Damage</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Reported hail damage from March storm. Missing shingles on back slope."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
                >
                  Save Lead to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {activeLeadDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveLeadDetails(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Lead Record #{activeLeadDetails.id}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">{activeLeadDetails.customerName}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {activeLeadDetails.address}, {activeLeadDetails.city}, {activeLeadDetails.state} {activeLeadDetails.zip}
            </p>

            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimated Deal</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  ${activeLeadDetails.estimatedValue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Lead Source</span>
                <span className="text-white font-medium">{activeLeadDetails.leadSource}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Phone (SMS)</span>
                <span className="text-slate-300 font-mono">{activeLeadDetails.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned Rep</span>
                <span className="text-slate-300">{activeLeadDetails.assignedSalesperson}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Inspection & Follow-Up Notes
              </span>
              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {activeLeadDetails.notes}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const leadToConvert = activeLeadDetails;
                  setActiveLeadDetails(null);
                  onConvertToQuote(leadToConvert);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Calculator className="w-4 h-4" />
                <span>Launch Roof Estimator for this Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
