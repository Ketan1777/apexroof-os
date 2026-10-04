import React, { useState } from 'react';
import {
  ShieldAlert,
  FileCheck2,
  Copy,
  Check,
  Printer,
  X,
  Camera,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { Quote } from '../../types';

interface InsuranceSupplementModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

export const InsuranceSupplementModal: React.FC<InsuranceSupplementModalProps> = ({
  quote,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [carrier, setCarrier] = useState('State Farm');
  const [claimNumber, setClaimNumber] = useState('CLM-2026-99412');
  const [deductible, setDeductible] = useState(1500);

  if (!isOpen) return null;

  const totalSquares = quote.calculation.totalSquares;

  // Standard Xactimate Roofing Codes
  const xactimateLineItems = [
    {
      code: 'RFG 240',
      description: 'Tear off & dispose comp shingles - 1 layer',
      unit: 'SQ',
      qty: totalSquares,
      unitPrice: 85.0,
      total: totalSquares * 85.0,
      notes: 'Required due to widespread granular loss and wind creasing.',
    },
    {
      code: 'RFG 300',
      description: 'Laminated - comp. shingle rfg. - w/ felt (OC Duration / Timberline HDZ)',
      unit: 'SQ',
      qty: totalSquares,
      unitPrice: 380.0,
      total: totalSquares * 380.0,
      notes: 'Matches existing architectural profile with Class 3/4 impact rating.',
    },
    {
      code: 'RFG IWS',
      description: 'Ice & water shield barrier (IRC Section R905.1.2 compliance)',
      unit: 'SF',
      qty: Math.round(totalSquares * 100 * 0.15),
      unitPrice: 2.1,
      total: Math.round(totalSquares * 100 * 0.15) * 2.1,
      notes: 'Mandatory in all roof valleys and 24" inside exterior heated wall.',
    },
    {
      code: 'RFG VENTR',
      description: 'Ridge vent - continuous low-profile exhaust ventilation',
      unit: 'LF',
      qty: 48,
      unitPrice: 14.5,
      total: 48 * 14.5,
      notes: 'Required to meet attic Net Free Ventilating Area (NFVA) 1:300 code.',
    },
    {
      code: 'RFG DRIP',
      description: 'Drip edge metal perimeter flashing',
      unit: 'LF',
      qty: 180,
      unitPrice: 3.25,
      total: 180 * 3.25,
      notes: 'IRC 2021 R905.2.8.5 code mandate along eaves and rakes.',
    },
    {
      code: 'RFG PIPE',
      description: 'Neoprene plumbing pipe jack flashing boot replacement',
      unit: 'EA',
      qty: 3,
      unitPrice: 65.0,
      total: 3 * 65.0,
      notes: 'Sun rotted & cracked gaskets causing ceiling leaks.',
    },
  ];

  const totalRCV = xactimateLineItems.reduce((acc, item) => acc + item.total, 0);
  const netClaimDue = Math.max(0, totalRCV - deductible);

  const supplementNoteText = `===========================================
INSURANCE SUPPLEMENT SCOPE (XACTIMATE FORMAT)
PROPERTY: ${quote.customer.address}, ${quote.customer.city}
HOMEOWNER: ${quote.customer.name} | Phone: ${quote.customer.phone}
INSURANCE CARRIER: ${carrier}
CLAIM NUMBER: ${claimNumber}
CONTRACTOR: Apex Roofing & Restoration (Lic #TX-ROOF-9941)
DATE OF LOSS INSPECTION: ${new Date().toLocaleDateString()}
===========================================
SUMMARY OF ESTIMATE:
Replacement Cost Value (RCV): $${Math.round(totalRCV).toLocaleString()}
Policyholder Deductible: $${deductible.toLocaleString()}
Net Insurance Claim Due: $${Math.round(netClaimDue).toLocaleString()}
===========================================
ITEMIZED XACTIMATE LINE ITEMS:
${xactimateLineItems
  .map(
    (item) =>
      `[${item.code}] ${item.description}\n` +
      `   Qty: ${item.qty} ${item.unit} @ $${item.unitPrice.toFixed(2)} = $${Math.round(item.total).toLocaleString()}\n` +
      `   Scope Justification: ${item.notes}`
  )
  .join('\n\n')}
===========================================
PHOTO DAMAGE EVIDENCE ATTACHED:
${quote.photos.map((p, i) => `Photo ${i + 1}: ${p.label} (${p.severity.toUpperCase()} Priority)`).join('\n')}
===========================================
Respectfully submitted by Field Estimator Marcus Vance, Apex Roofing.`;

  const handleCopyScope = () => {
    navigator.clipboard.writeText(supplementNoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-950/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0a1712] to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Insurance Supplement & Xactimate Code Generator</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Carrier Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Formats estimate for State Farm, Allstate & USAA adjusters
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

        {/* Claim Info Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-400" /> Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="State Farm">State Farm Insurance</option>
              <option value="Allstate">Allstate</option>
              <option value="USAA">USAA Military</option>
              <option value="Liberty Mutual">Liberty Mutual</option>
              <option value="Travelers">Travelers</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Claim Number</label>
            <input
              type="text"
              value={claimNumber}
              onChange={(e) => setClaimNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Homeowner Deductible ($)</label>
            <input
              type="number"
              step="250"
              value={deductible}
              onChange={(e) => setDeductible(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-[#0a1510] border-b border-emerald-950/80 text-center shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total RCV Claim</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              ${Math.round(totalRCV).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deductible</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
              ${deductible.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Net Carrier Check</span>
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              ${Math.round(netClaimDue).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Xactimate Table */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Xactimate Code</th>
                  <th className="p-3">Description & Code Justification</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">RCV Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {xactimateLineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {item.code}
                    </td>
                    <td className="p-3 text-white">
                      <span className="font-semibold block">{item.description}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {item.notes}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      {item.qty} {item.unit}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ${Math.round(item.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Includes {quote.photos.length} hail/wind damage photo citations</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Carrier Packet</span>
            </button>

            <button
              type="button"
              onClick={handleCopyScope}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Scope Copied!' : 'Copy Adjuster Scope'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
