import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  Sliders
} from 'lucide-react';
import { Quote } from '../../types';

interface JobCostingMeterProps {
  quote: Quote;
}

export const JobCostingMeter: React.FC<JobCostingMeterProps> = ({ quote }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [laborPerSquare, setLaborPerSquare] = useState<number>(85); // standard tear-off & install labor
  const [materialPerSquare, setMaterialPerSquare] = useState<number>(130); // shingles, underlayment, nails, vents
  const [dumpsterFee, setDumpsterFee] = useState<number>(550); // 30-yd roll-off dumpster
  const [permitFee, setPermitFee] = useState<number>(250); // municipal roofing permit
  const [showSliders, setShowSliders] = useState(false);

  const totalSquares = quote.calculation.totalSquares;
  const estimatedLabor = Math.round(totalSquares * laborPerSquare);
  const estimatedMaterials = Math.round(totalSquares * materialPerSquare);
  const totalCost = estimatedLabor + estimatedMaterials + dumpsterFee + permitFee;
  const grossProfit = quote.total - totalCost;
  const marginPercent = quote.total > 0 ? (grossProfit / quote.total) * 100 : 0;

  const getMarginBadge = () => {
    if (marginPercent >= 45) {
      return {
        label: 'Elite Margin (45%+)',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        note: 'Exceptional profitability. Ideal for growth & high sales commission.',
      };
    }
    if (marginPercent >= 32) {
      return {
        label: 'Healthy Margin (32%-44%)',
        color: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
        note: 'Solid industry-standard roofing margin. Stable cash flow.',
      };
    }
    return {
      label: 'Tight Margin (<32%)',
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      note: 'Tight margin. Check material tier discounts or negotiate crew labor rate.',
    };
  };

  const badge = getMarginBadge();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Contractor Profit Margin & Job Costing Meter
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                Internal Only
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live COGS (Labor, Materials, Dumpster, Permits) vs Revenue with instant margin calculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showSliders ? 'Hide Rates' : 'Adjust Rates'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* Main Profit Stat Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Gross Contract Value
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                ${Math.round(quote.total).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">Total customer invoice</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Job Cost (COGS)
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                ${totalCost.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Labor + Materials + Overhead
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Estimated Net Profit
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ${grossProfit.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">Company gross profit dollars</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
                Net Profit Margin %
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {marginPercent > 40 ? 'Exceptional health' : 'Standard target'}
              </span>
            </div>
          </div>

          {/* Margin Health Bar & Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">{badge.note}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                Cost Ratio: {((totalCost / (quote.total || 1)) * 100).toFixed(0)}% Costs / {marginPercent.toFixed(0)}% Margin
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${Math.min(100, Math.max(0, (estimatedMaterials / (quote.total || 1)) * 100))}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`Materials: $${estimatedMaterials}`}
              />
              <div
                style={{ width: `${Math.min(100, Math.max(0, (estimatedLabor / (quote.total || 1)) * 100))}%` }}
                className="bg-indigo-500 h-full transition-all"
                title={`Labor: $${estimatedLabor}`}
              />
              <div
                style={{ width: `${Math.min(100, Math.max(0, ((dumpsterFee + permitFee) / (quote.total || 1)) * 100))}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Dumpster/Permit: $${dumpsterFee + permitFee}`}
              />
              <div
                style={{ width: `${Math.min(100, Math.max(0, marginPercent))}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
                title={`Profit: $${grossProfit}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Materials: ${estimatedMaterials.toLocaleString()} (${materialPerSquare}/SQ)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Crew Labor: ${estimatedLabor.toLocaleString()} (${laborPerSquare}/SQ)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Dumpster & Permit: ${(dumpsterFee + permitFee).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold ml-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Net Profit: ${grossProfit.toLocaleString()} ({marginPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Adjustable Rate Sliders (Tuck-in) */}
          {showSliders && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/90 p-4 rounded-2xl border border-emerald-950/60 animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex justify-between">
                  <span>Crew Labor Rate</span>
                  <span className="font-mono text-emerald-400 font-bold">${laborPerSquare}/SQ</span>
                </label>
                <input
                  type="range"
                  min="55"
                  max="130"
                  step="5"
                  value={laborPerSquare}
                  onChange={(e) => setLaborPerSquare(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                />
                <span className="text-[10px] text-slate-500">Tear-off + installation wage</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex justify-between">
                  <span>Material Cost Rate</span>
                  <span className="font-mono text-emerald-400 font-bold">${materialPerSquare}/SQ</span>
                </label>
                <input
                  type="range"
                  min="90"
                  max="220"
                  step="5"
                  value={materialPerSquare}
                  onChange={(e) => setMaterialPerSquare(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                />
                <span className="text-[10px] text-slate-500">ABC / Beacon shingle & paper costs</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex justify-between">
                  <span>Dumpster / Debris</span>
                  <span className="font-mono text-emerald-400 font-bold">${dumpsterFee}</span>
                </label>
                <input
                  type="range"
                  min="300"
                  max="1000"
                  step="50"
                  value={dumpsterFee}
                  onChange={(e) => setDumpsterFee(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                />
                <span className="text-[10px] text-slate-500">30-yard roll-off haul</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex justify-between">
                  <span>City Permit & Insp</span>
                  <span className="font-mono text-emerald-400 font-bold">${permitFee}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="25"
                  value={permitFee}
                  onChange={(e) => setPermitFee(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                />
                <span className="text-[10px] text-slate-500">Municipal inspection pass</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
