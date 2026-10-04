import React from 'react';
import { PlusCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { AddonItem } from '../../types';

interface AddonSelectorProps {
  addons: AddonItem[];
  totalSquares: number;
  onToggleAddon: (id: string) => void;
}

export const AddonSelector: React.FC<AddonSelectorProps> = ({
  addons,
  totalSquares,
  onToggleAddon,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Roof Upgrades & Protection Add-ons
          </h3>
          <p className="text-xs text-slate-400">Toggle recommended site additions & water management</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          {addons.filter((a) => a.selected).length} Upgrades Selected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {addons.map((addon) => {
          const calculatedPrice =
            addon.unit === 'per_square' ? addon.price * totalSquares : addon.price;

          return (
            <div
              key={addon.id}
              onClick={() => onToggleAddon(addon.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                addon.selected
                  ? 'bg-slate-950/90 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="mt-0.5">
                {addon.selected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      addon.selected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {addon.name}
                  </h4>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black font-mono ${
                        addon.selected ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      +${Math.round(calculatedPrice).toLocaleString()}
                    </span>
                    {addon.unit === 'per_square' && (
                      <span className="text-[10px] text-slate-500 block">
                        (${addon.price}/sq)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {addon.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
