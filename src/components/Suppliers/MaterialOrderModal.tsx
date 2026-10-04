import React, { useState } from 'react';
import {
  Package,
  Truck,
  Copy,
  Check,
  Printer,
  X,
  Building2,
  FileSpreadsheet,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Quote } from '../../types';
import { SHINGLE_TIERS } from '../../data/seedData';

interface MaterialOrderModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialOrderModal: React.FC<MaterialOrderModalProps> = ({
  quote,
  isOpen,
  onClose,
}) => {
  const [supplier, setSupplier] = useState<'abc' | 'beacon' | 'srs' | 'homedepot'>('abc');
  const [deliveryType, setDeliveryType] = useState<'roof_load' | 'ground_drop'>('roof_load');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalSquares = quote.calculation.totalSquares;
  const groundSqFt = quote.calculation.groundSqFt;
  const selectedTier = SHINGLE_TIERS[quote.selectedTier];

  // Mathematical Material Calculations
  const shingleBundles = Math.ceil(totalSquares * 3);
  const ridgeCapBundles = Math.ceil(totalSquares / 8);
  const starterStripBundles = Math.ceil(totalSquares / 9);
  const syntheticFeltRolls = Math.ceil(totalSquares / 10); // 10 sq/roll
  const iceWaterRolls = Math.ceil((totalSquares * 0.15) / 2); // 2 sq/roll in valleys
  const coilNailBoxes = Math.ceil(totalSquares / 12); // 7,200 nails per box
  const capNailBoxes = Math.ceil(totalSquares / 25);
  const dripEdgeSticks = Math.ceil((Math.sqrt(groundSqFt) * 4) / 10); // 10-ft perimeter sticks
  const ridgeVentSections = Math.ceil(totalSquares / 3); // 4-ft sections

  const SUPPLIERS = {
    abc: { name: 'ABC Supply Co.', repName: 'Dave - South Austin Yard', phone: '(512) 441-9988' },
    beacon: { name: 'Beacon Building Products', repName: 'Travis - Austin Branch #12', phone: '(512) 385-2244' },
    srs: { name: 'SRS Distribution', repName: 'Carlos - North Austin Dispatch', phone: '(512) 836-1100' },
    homedepot: { name: 'Home Depot Pro Desk', repName: 'Commercial Desk #6512', phone: '(512) 459-1122' },
  };

  const selectedSupplierInfo = SUPPLIERS[supplier];

  const materialList = [
    {
      item: `${selectedTier.brand} Shingles`,
      qty: shingleBundles,
      unit: 'Bundles',
      category: 'Field Shingles (3 bdl/SQ)',
    },
    {
      item: 'Pro-Cut Hip & Ridge Cap Shingles',
      qty: ridgeCapBundles,
      unit: 'Bundles',
      category: 'Perimeter & Ridge Trim',
    },
    {
      item: 'Universal High-Wind Starter Strip',
      qty: starterStripBundles,
      unit: 'Bundles',
      category: 'Eave & Rake Line',
    },
    {
      item: 'DeckDefense / Synthetic Felt Underlayment',
      qty: syntheticFeltRolls,
      unit: 'Rolls (10 SQ/roll)',
      category: 'Roof Deck Barrier',
    },
    {
      item: 'WeatherWatch / Self-Adhering Ice & Water',
      qty: iceWaterRolls,
      unit: 'Rolls (200 sq ft)',
      category: 'Valley & Eave Waterproofing',
    },
    {
      item: '1-1/4" Electro-Galvanized Coil Roofing Nails',
      qty: coilNailBoxes,
      unit: 'Boxes (7,200 ct)',
      category: 'Pneumatic Fasteners',
    },
    {
      item: '1" Round Plastic Cap Electro-Nails',
      qty: capNailBoxes,
      unit: 'Boxes (3,000 ct)',
      category: 'Underlayment Fasteners',
    },
    {
      item: 'T-Style Aluminum Drip Edge Flashing (10-ft)',
      qty: dripEdgeSticks,
      unit: 'Sticks (10 ft)',
      category: 'Perimeter Flashing',
    },
    {
      item: 'Cobra / Continuous Low-Profile Ridge Vent (4-ft)',
      qty: ridgeVentSections,
      unit: 'Pieces (4 ft)',
      category: 'Exhaust Ventilation',
    },
  ];

  const poText = `===========================================
PURCHASE ORDER: Apex Roofing & Restoration
JOB REF: ${quote.id} | ${quote.customer.name}
DELIVERY ADDRESS: ${quote.customer.address}, ${quote.customer.city}
SUPPLIER: ${selectedSupplierInfo.name} (${selectedSupplierInfo.repName})
DELIVERY METHOD: ${deliveryType === 'roof_load' ? 'ROOF LOAD (Boom Crane 45-ft)' : 'GROUND DROP'}
TOTAL ROOF SQUARES: ${totalSquares} SQ
===========================================
${materialList.map((m) => `- ${m.qty} ${m.unit} | ${m.item} (${m.category})`).join('\n')}
===========================================
ORDER NOTES: Require 2-hour advance driver ETA call to Foreman Marcus at (512) 842-9912.`;

  const handleCopyPO = () => {
    navigator.clipboard.writeText(poText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanRepPhone = selectedSupplierInfo.phone.replace(/[^0-9]/g, '');
  const smsHref = `sms:${cleanRepPhone}?body=${encodeURIComponent(poText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Material Supply Order Sheet</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {totalSquares} SQ Pull
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Job #{quote.id} &bull; {quote.customer.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Supply House Partner
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="abc">ABC Supply Co. (Austin South)</option>
              <option value="beacon">Beacon Building Products</option>
              <option value="srs">SRS Distribution</option>
              <option value="homedepot">Home Depot Pro Desk</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-teal-400" /> Delivery Logistics
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('roof_load')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                  deliveryType === 'roof_load'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Boom Roof Load
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('ground_drop')}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                  deliveryType === 'ground_drop'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Ground Drop
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Materials Table */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Required Material Item</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3">Unit Specs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {materialList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      {m.item}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {m.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-400 text-sm">
                      {m.qty}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            <span className="text-white font-medium">{selectedSupplierInfo.name}</span> &bull; {selectedSupplierInfo.phone}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={smsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Text PO to Rep</span>
            </a>

            <button
              type="button"
              onClick={handleCopyPO}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'PO Copied!' : 'Copy Order Sheet'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
