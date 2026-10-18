import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Eye,
  X,
  FileCheck,
  AlertTriangle,
  HardHat,
  Truck
} from 'lucide-react';
import { RoofingJob, JobLifecycleStage } from '../../types';

interface JobLifecycleViewProps {
  jobs: RoofingJob[];
  onUpdateJob: (updated: RoofingJob) => void;
  onGenerateInvoice: (job: RoofingJob) => void;
  onOpenEstimatorForJob?: (quoteId: string) => void;
}

const JOB_STAGES: { id: JobLifecycleStage; label: string; icon: any; color: string; border: string; bg: string }[] = [
  { id: 'quote_approved', label: 'Quote Approved', icon: FileCheck, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'deposit_received', label: 'Deposit Received', icon: DollarSign, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'materials_ordered', label: 'Materials Ordered', icon: Package, color: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
  { id: 'scheduled', label: 'Crew Scheduled', icon: Calendar, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'in_progress', label: 'Work In Progress', icon: HardHat, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'quality_inspection', label: 'Quality Check', icon: ShieldCheck, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'completed', label: 'Job Completed', icon: CheckCircle2, color: 'text-emerald-300', border: 'border-emerald-400/40', bg: 'bg-emerald-500/15' },
  { id: 'invoiced', label: 'Invoiced', icon: Receipt, color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
  { id: 'paid', label: 'Paid in Full', icon: DollarSign, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/20' },
];

export const JobLifecycleView: React.FC<JobLifecycleViewProps> = ({
  jobs,
  onUpdateJob,
  onGenerateInvoice,
  onOpenEstimatorForJob,
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<RoofingJob | null>(null);

  // Financial aggregates
  const totalContractRevenue = jobs.reduce((sum, j) => sum + j.contractAmount, 0);
  const totalDepositsCollected = jobs.reduce((sum, j) => sum + j.depositPaid, 0);
  const totalGrossProfit = jobs.reduce((sum, j) => sum + j.grossProfit, 0);
  const avgMargin = totalContractRevenue > 0 ? (totalGrossProfit / totalContractRevenue) * 100 : 0;
  const activeJobsCount = jobs.filter((j) => j.stage !== 'completed' && j.stage !== 'paid').length;

  const filteredJobs = jobs.filter((j) => {
    if (filterStage === 'all') return true;
    return j.stage === filterStage;
  });

  const getNextStage = (current: JobLifecycleStage): JobLifecycleStage | null => {
    const order: JobLifecycleStage[] = [
      'quote_approved',
      'deposit_received',
      'materials_ordered',
      'scheduled',
      'in_progress',
      'quality_inspection',
      'completed',
      'invoiced',
      'paid',
    ];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  const handleAdvanceStage = (job: RoofingJob) => {
    const next = getNextStage(job.stage);
    if (next) {
      const updated = { ...job, stage: next };
      onUpdateJob(updated);
      if (selectedJob?.id === job.id) {
        setSelectedJob(updated);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shadow-inner">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                Job Lifecycle & Operations
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                End-to-End Workflow
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Track jobs from quote approval & deposit through material delivery, tear-off, and final invoicing
            </p>
          </div>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Stages ({jobs.length})</option>
            {JOB_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Jobs in Production
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {activeJobsCount}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Tear-off, install & quality check</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Contract Revenue
          </span>
          <span className="text-2xl font-black text-purple-400 font-mono mt-1 block">
            ${totalContractRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">${totalDepositsCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })} deposit held in escrow</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Gross Profit
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ${totalGrossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">After materials, labor & dumpster</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Profit Margin
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {avgMargin.toFixed(1)}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">High profitability health</span>
        </div>
      </div>

      {/* Jobs Table & Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          const stageConfig = JOB_STAGES.find((s) => s.id === job.stage) || JOB_STAGES[0];
          const nextStage = getNextStage(job.stage);
          const nextStageConfig = nextStage ? JOB_STAGES.find((s) => s.id === nextStage) : null;

          return (
            <div
              key={job.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-purple-400">
                        {job.jobId}
                      </span>
                      <span className="text-[10px] text-slate-500">Ref: {job.quoteId}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{job.customer.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {job.customer.address}, {job.customer.city}
                    </p>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${stageConfig.border} ${stageConfig.bg} ${stageConfig.color} flex items-center gap-1.5 shrink-0`}>
                    <stageConfig.icon className="w-3.5 h-3.5" />
                    {stageConfig.label}
                  </span>
                </div>

                {/* Job Specs Row */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs font-mono mb-3">
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Total Roof Area</span>
                    <span className="text-white font-bold">{job.totalSquares} SQ</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-500 block">Contract Amount</span>
                    <span className="text-white font-bold">${Math.round(job.contractAmount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-emerald-400 block">Est. Gross Margin</span>
                    <span className="text-emerald-400 font-bold">{job.marginPercent.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Crew and Schedule */}
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Crew: <strong className="text-slate-200">{job.assignedCrewName || 'Unassigned'}</strong></span>
                  </p>
                  {job.scheduledStartDate && (
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Production Dates: <strong className="text-slate-200">{job.scheduledStartDate} &rarr; {job.scheduledEndDate}</strong></span>
                    </p>
                  )}
                  {job.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-2">
                      &ldquo;{job.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Job Details & COGS</span>
                </button>

                <div className="flex items-center gap-2">
                  {nextStageConfig && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStage(job)}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title={`Advance to ${nextStageConfig.label}`}
                    >
                      <span>Mark {nextStageConfig.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Generate Invoice button */}
                  <button
                    type="button"
                    onClick={() => onGenerateInvoice(job)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
                    title="Generate and issue formal customer invoice"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Details & Costing Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-black text-purple-400">
                {selectedJob.jobId}
              </span>
              <span className="text-[10px] text-slate-500">&bull; Quote #{selectedJob.quoteId}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{selectedJob.customer.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {selectedJob.customer.address}, {selectedJob.customer.city}, {selectedJob.customer.state}
            </p>

            {/* Financial Job Costing Breakdown (Priority 3 requirement) */}
            <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Job Costing & Profit Margin
                </span>
                <span className="text-xs font-black font-mono text-emerald-400">
                  {selectedJob.marginPercent.toFixed(1)}% Gross Margin
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">Contract Revenue (Homeowner Total):</span>
                  <span className="font-bold text-white">${selectedJob.contractAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span className="font-sans">&minus; Materials (Shingles, Nails, Paper):</span>
                  <span>-${selectedJob.materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span className="font-sans">&minus; Crew Labor (Tear-off & Install):</span>
                  <span>-${selectedJob.laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span className="font-sans">&minus; 30-Yd Dumpster & City Permits:</span>
                  <span>-${selectedJob.dumpsterPermitCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-emerald-400 font-bold text-sm">
                  <span className="font-sans">Net Company Gross Profit:</span>
                  <span>+${selectedJob.grossProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deposit & Balance status */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] font-sans text-slate-500 uppercase block">Deposit Collected</span>
                <span className="text-emerald-400 font-bold">${selectedJob.depositPaid.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-slate-500 uppercase block">Balance Due at Finish</span>
                <span className="text-amber-400 font-bold">${selectedJob.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const jobToInvoice = selectedJob;
                  setSelectedJob(null);
                  onGenerateInvoice(jobToInvoice);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Receipt className="w-4 h-4" />
                <span>Issue Final Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
