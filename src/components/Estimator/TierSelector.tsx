import React from 'react';
import { Check, Shield, Zap, Sparkles, Award } from 'lucide-react';
import { ShingleTierId, ShingleTier } from '../../types';
import { SHINGLE_TIERS } from '../../data/seedData';

interface TierSelectorProps {
  selectedTier: ShingleTierId;
  onSelectTier: (tierId: ShingleTierId) => void;
  totalSquares: number;
}

export const TierSelector: React.FC<TierSelectorProps> = ({
  selectedTier,
  onSelectTier,
  totalSquares,
}) => {
  const tiers: ShingleTier[] = Object.values(SHINGLE_TIERS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Roofing System Package (Good / Better / Best)
          </h3>
          <p className="text-xs text-slate-400">Select material warranty & wind rating level</p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
          Based on {totalSquares.toFixed(1)} Squares
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const tierCost = tier.pricePerSquare * totalSquares;

          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={`relative rounded-2xl p-5 cursor-pointer transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-emerald-500/15 via-slate-900 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Tier {tier.id.toUpperCase()}
                    </span>
                    <h4 className="text-base font-bold text-white">{tier.name}</h4>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-emerald-300 font-medium mb-1">{tier.brand}</p>
                <p className="text-[11px] text-slate-400 mb-3">{tier.warranty}</p>

                {/* Specs badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-teal-400" /> {tier.windRating}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-emerald-400" /> {tier.algaeResistance}
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-1.5 mb-5 border-t border-slate-800/80 pt-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">${tier.pricePerSquare}/sq installed</span>
                  <span className="text-xs text-slate-500 font-mono">Materials + Labor</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">
                    ${Math.round(tierCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
