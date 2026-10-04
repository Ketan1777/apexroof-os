import React from 'react';
import { Calculator, Compass, Layers, Package, ShieldCheck } from 'lucide-react';
import { RoofCalculation, RoofPitch } from '../../types';
import { PITCH_CONFIGS } from '../../data/seedData';

interface PitchAndSquaresCalculatorProps {
  calculation: RoofCalculation;
  onChange: (calc: RoofCalculation) => void;
}

export const PitchAndSquaresCalculator: React.FC<PitchAndSquaresCalculatorProps> = ({
  calculation,
  onChange,
}) => {
  const recalculate = (
    groundSqFt: number,
    pitch: RoofPitch,
    wastePercent: number,
    stories: number
  ) => {
    const pitchMultiplier = PITCH_CONFIGS[pitch]?.multiplier || 1.12;
    const storiesMultiplier = stories === 2 ? 1.08 : stories === 3 ? 1.16 : 1.0;

    const pitchAdjustedSqFt = groundSqFt * pitchMultiplier * storiesMultiplier;
    const rawSquares = pitchAdjustedSqFt / 100;
    const totalSquares = rawSquares * (1 + wastePercent / 100);
    const bundleCount = Math.ceil(totalSquares * 3);

    onChange({
      groundSqFt,
      pitch,
      wastePercent,
      stories,
      rawSquares: Number(rawSquares.toFixed(2)),
      totalSquares: Number(totalSquares.toFixed(2)),
      bundleCount,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Roof Measurement Engine</h3>
            <p className="text-xs text-slate-400">Ground footprint, pitch geometry & shingle bundle calculator</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Auto Waste Factoring
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Ground Sq Footage */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ground Footprint (Sq Ft)
          </label>
          <div className="relative">
            <input
              type="number"
              step="50"
              min="500"
              value={calculation.groundSqFt}
              onChange={(e) =>
                recalculate(
                  Number(e.target.value) || 0,
                  calculation.pitch,
                  calculation.wastePercent,
                  calculation.stories
                )
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sq ft</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">From aerial tape or foundation</span>
        </div>

        {/* Roof Pitch Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> Roof Pitch Slope
          </label>
          <select
            value={calculation.pitch}
            onChange={(e) =>
              recalculate(
                calculation.groundSqFt,
                e.target.value as RoofPitch,
                calculation.wastePercent,
                calculation.stories
              )
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            {Object.entries(PITCH_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} ({config.multiplier}x)
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {PITCH_CONFIGS[calculation.pitch]?.description}
          </span>
        </div>

        {/* Stories / Staging */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" /> Building Height
          </label>
          <select
            value={calculation.stories}
            onChange={(e) =>
              recalculate(
                calculation.groundSqFt,
                calculation.pitch,
                calculation.wastePercent,
                Number(e.target.value)
              )
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={1}>1-Story (Standard eave access)</option>
            <option value={2}>2-Story (+8% safety/staging)</option>
            <option value={3}>3-Story (+16% high lift/chute)</option>
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">Tear-off & ladder staging factor</span>
        </div>

        {/* Waste Percentage */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Valley & Cut Waste (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="25"
              step="1"
              value={calculation.wastePercent}
              onChange={(e) =>
                recalculate(
                  calculation.groundSqFt,
                  calculation.pitch,
                  Number(e.target.value),
                  calculation.stories
                )
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-sm font-bold font-mono text-emerald-400 min-w-[3ch]">
              {calculation.wastePercent}%
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Simple (10%)</span>
            <span>Hip/Valley (15%)</span>
            <span>Turret (20%)</span>
          </div>
        </div>
      </div>

      {/* Calculated Metric Output Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            True Pitch Multiplier
          </span>
          <span className="text-lg font-black text-emerald-400">
            {PITCH_CONFIGS[calculation.pitch]?.multiplier.toFixed(2)}x
          </span>
          <span className="text-[10px] text-slate-500 block">Geometry slope expansion</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            True Roof Area
          </span>
          <span className="text-lg font-black text-white">
            {Math.round(calculation.totalSquares * 100).toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">sq ft</span>
          </span>
          <span className="text-[10px] text-slate-500 block">Includes {calculation.wastePercent}% cut waste</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            Total Roof Squares
          </span>
          <span className="text-2xl font-black text-white">
            {calculation.totalSquares.toFixed(1)}{' '}
            <span className="text-xs text-emerald-400 font-semibold">SQ</span>
          </span>
          <span className="text-[10px] text-slate-500 block">100 sq ft per roofing square</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Package className="w-3 h-3 text-teal-400" /> Material Delivery
          </span>
          <span className="text-lg font-black text-teal-400">
            {calculation.bundleCount}{' '}
            <span className="text-xs text-slate-400 font-normal">Bundles</span>
          </span>
          <span className="text-[10px] text-slate-500 block">3 bundles / square on pallet</span>
        </div>
      </div>
    </div>
  );
};
