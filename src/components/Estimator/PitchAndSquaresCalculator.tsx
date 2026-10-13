import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Compass,
  Layers,
  Package,
  ShieldCheck,
  Ruler,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { RoofCalculation, RoofPitch } from '../../types';
import { PITCH_CONFIGS } from '../../data/seedData';

interface PitchAndSquaresCalculatorProps {
  calculation: RoofCalculation;
  onChange: (calc: RoofCalculation) => void;
}

const FOOTPRINT_PRESETS = [
  { label: '1,500 sq ft', name: 'Cottage / Ranch', sqFt: 1500 },
  { label: '2,000 sq ft', name: 'Mid-Size Home', sqFt: 2000 },
  { label: '2,400 sq ft', name: 'Avg 3-4 Bed', sqFt: 2400 },
  { label: '3,000 sq ft', name: 'Large 2-Story', sqFt: 3000 },
  { label: '3,800 sq ft', name: 'Custom Estate', sqFt: 3800 },
];

export const PitchAndSquaresCalculator: React.FC<PitchAndSquaresCalculatorProps> = ({
  calculation,
  onChange,
}) => {
  // Local string state to prevent typing lockout or awkward backspacing
  const [localSqFt, setLocalSqFt] = useState<string>(String(calculation.groundSqFt || 2400));
  const [calcMode, setCalcMode] = useState<'direct' | 'dimensions'>('direct');
  const [lengthFt, setLengthFt] = useState<number>(60);
  const [widthFt, setWidthFt] = useState<number>(40);

  // Keep local string in sync if parent changes externally
  useEffect(() => {
    if (calculation.groundSqFt && Number(localSqFt) !== calculation.groundSqFt) {
      setLocalSqFt(String(calculation.groundSqFt));
    }
  }, [calculation.groundSqFt]);

  const recalculate = (
    groundSqFt: number,
    pitch: RoofPitch,
    wastePercent: number,
    stories: number
  ) => {
    const validGroundSqFt = Math.max(0, groundSqFt);
    const pitchMultiplier = PITCH_CONFIGS[pitch]?.multiplier || 1.12;
    const storiesMultiplier = stories === 2 ? 1.08 : stories === 3 ? 1.16 : 1.0;

    const pitchAdjustedSqFt = validGroundSqFt * pitchMultiplier * storiesMultiplier;
    const rawSquares = pitchAdjustedSqFt / 100;
    const totalSquares = rawSquares * (1 + wastePercent / 100);
    const bundleCount = Math.ceil(totalSquares * 3);

    onChange({
      groundSqFt: validGroundSqFt,
      pitch,
      wastePercent,
      stories,
      rawSquares: Number(rawSquares.toFixed(2)),
      totalSquares: Number(totalSquares.toFixed(2)),
      bundleCount,
    });
  };

  const handleSqFtChange = (val: string) => {
    setLocalSqFt(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      recalculate(num, calculation.pitch, calculation.wastePercent, calculation.stories);
    }
  };

  const handleApplyPreset = (sqFt: number) => {
    setLocalSqFt(String(sqFt));
    recalculate(sqFt, calculation.pitch, calculation.wastePercent, calculation.stories);
  };

  const handleDimensionChange = (newLen: number, newWid: number) => {
    setLengthFt(newLen);
    setWidthFt(newWid);
    const calculatedSqFt = Math.round(newLen * newWid);
    setLocalSqFt(String(calculatedSqFt));
    recalculate(calculatedSqFt, calculation.pitch, calculation.wastePercent, calculation.stories);
  };

  const pitchMultiplier = PITCH_CONFIGS[calculation.pitch]?.multiplier || 1.12;
  const storiesMultiplier = calculation.stories === 2 ? 1.08 : calculation.stories === 3 ? 1.16 : 1.0;
  const rawRoofArea = Math.round(calculation.groundSqFt * pitchMultiplier * storiesMultiplier);
  const wasteAddedSqFt = Math.round(rawRoofArea * (calculation.wastePercent / 100));
  const finalTotalSqFt = rawRoofArea + wasteAddedSqFt;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Roof Footprint & Measurement Engine
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold normal-case">
                Live Calculation
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Translates ground footprint into sloped roof area, total squares & shingle bundles
            </p>
          </div>
        </div>

        {/* Input Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCalcMode('direct')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              calcMode === 'direct'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Sq Ft
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('dimensions')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              calcMode === 'dimensions'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Length × Width
          </button>
        </div>
      </div>

      {/* Primary Calculator Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        {/* Footprint Input Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Ground Footprint</span>
            <span className="text-[10px] text-emerald-400 font-mono font-normal">Foundation Area</span>
          </label>

          {calcMode === 'direct' ? (
            <div className="relative">
              <input
                type="number"
                step="50"
                min="100"
                value={localSqFt}
                onChange={(e) => handleSqFtChange(e.target.value)}
                placeholder="2400"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-bold text-white focus:outline-none focus:border-emerald-500 font-mono tracking-wide"
              />
              <span className="absolute right-3 top-3 text-xs text-slate-500 font-bold pointer-events-none">
                sq ft
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={lengthFt}
                  onChange={(e) => handleDimensionChange(Number(e.target.value) || 0, widthFt)}
                  placeholder="60"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-semibold">L (ft)</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={widthFt}
                  onChange={(e) => handleDimensionChange(lengthFt, Number(e.target.value) || 0)}
                  placeholder="40"
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-semibold">W (ft)</span>
              </div>
            </div>
          )}

          <span className="text-[10px] text-slate-500 mt-1 block">
            {calcMode === 'dimensions'
              ? `${lengthFt} ft × ${widthFt} ft = ${(lengthFt * widthFt).toLocaleString()} sq ft`
              : 'From aerial tape, foundation, or tax roll'}
          </span>
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {Object.entries(PITCH_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label} ({config.multiplier.toFixed(2)}x slope)
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value={1}>1-Story (Standard eave access 1.0x)</option>
            <option value={2}>2-Story (+8% safety/staging 1.08x)</option>
            <option value={3}>3-Story (+16% high lift/chute 1.16x)</option>
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">Tear-off & ladder staging factor</span>
        </div>

        {/* Waste Percentage */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Cut & Valley Waste</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{calculation.wastePercent}%</span>
          </label>
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
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Gable (10%)</span>
            <span>Hip/Valley (15%)</span>
            <span>Complex (20%+)</span>
          </div>
        </div>
      </div>

      {/* Quick Footprint Size Presets */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Presets:
        </span>
        {FOOTPRINT_PRESETS.map((p) => {
          const isActive = calculation.groundSqFt === p.sqFt;
          return (
            <button
              key={p.sqFt}
              type="button"
              onClick={() => handleApplyPreset(p.sqFt)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {p.label} <span className="text-[10px] opacity-75 font-normal">({p.name})</span>
            </button>
          );
        })}
      </div>

      {/* Live Calculation Formula Breakdown Bar (Mathematical Transparency) */}
      <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-950/70 text-xs">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" />
          <span>Transparent Mathematical Calculation Breakdown:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-slate-300 font-mono text-[11px]">
          <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Ground Footprint</span>
            <span className="text-white font-bold">{calculation.groundSqFt.toLocaleString()} sq ft</span>
          </span>
          <span className="text-emerald-400 font-bold">&times;</span>
          <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Pitch Multiplier ({calculation.pitch})</span>
            <span className="text-white font-bold">{pitchMultiplier.toFixed(2)}x</span>
          </span>
          {calculation.stories > 1 && (
            <>
              <span className="text-emerald-400 font-bold">&times;</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px] font-sans">Height Staging ({calculation.stories}-Story)</span>
                <span className="text-white font-bold">{storiesMultiplier.toFixed(2)}x</span>
              </span>
            </>
          )}
          <span className="text-emerald-400 font-bold">=</span>
          <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Raw Sloped Area</span>
            <span className="text-white font-bold">{rawRoofArea.toLocaleString()} sq ft</span>
          </span>
          <span className="text-emerald-400 font-bold">+</span>
          <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[9px] font-sans">Waste ({calculation.wastePercent}%)</span>
            <span className="text-emerald-400 font-bold">+{wasteAddedSqFt.toLocaleString()} sq ft</span>
          </span>
          <span className="text-emerald-400 font-bold">=</span>
          <span className="bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-black">
            <span className="text-emerald-500 block text-[9px] font-sans">Billable Roofing Squares</span>
            <span>{calculation.totalSquares.toFixed(1)} SQ ({finalTotalSqFt.toLocaleString()} sq ft)</span>
          </span>
        </div>
      </div>

      {/* Final Calculated Metric Output Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            True Pitch Factor
          </span>
          <span className="text-xl font-black text-emerald-400">
            {pitchMultiplier.toFixed(2)}x
          </span>
          <span className="text-[10px] text-slate-500 block">Geometry slope expansion</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            True Roof Area
          </span>
          <span className="text-xl font-black text-white">
            {finalTotalSqFt.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-normal">sq ft</span>
          </span>
          <span className="text-[10px] text-slate-500 block">With {calculation.wastePercent}% cut waste</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            Total Roof Squares
          </span>
          <span className="text-2xl font-black text-white">
            {calculation.totalSquares.toFixed(1)}{' '}
            <span className="text-xs text-emerald-400 font-semibold">SQ</span>
          </span>
          <span className="text-[10px] text-slate-500 block">100 sq ft = 1 roofing square</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block flex items-center gap-1">
            <Package className="w-3 h-3 text-teal-400" /> Material Delivery
          </span>
          <span className="text-xl font-black text-teal-400">
            {calculation.bundleCount}{' '}
            <span className="text-xs text-slate-400 font-normal">Bundles</span>
          </span>
          <span className="text-[10px] text-slate-500 block">3 bundles per square</span>
        </div>
      </div>
    </div>
  );
};
