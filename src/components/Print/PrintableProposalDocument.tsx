import React from 'react';
import { Quote } from '../../types';
import { SHINGLE_TIERS } from '../../data/seedData';
import { ShieldCheck, Check, Phone, Mail, MapPin, Calendar, FileText } from 'lucide-react';

interface PrintableProposalDocumentProps {
  quote: Quote;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export const PrintableProposalDocument: React.FC<PrintableProposalDocumentProps> = ({
  quote,
  companyName = 'Apex Roofing & Restoration',
  companyPhone = '(512) 842-9912',
  companyEmail = 'owner@apexroofaustin.com',
}) => {
  const selectedTier = SHINGLE_TIERS[quote.selectedTier] || SHINGLE_TIERS.better;
  const activeAddons = quote.addons.filter((a) => a.selected);

  return (
    <div className="print-document hidden print:block text-slate-900 bg-white font-sans p-8 max-w-4xl mx-auto">
      {/* 1. Header & Company Identity */}
      <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{companyName}</h1>
          </div>
          <p className="text-xs text-slate-600 flex items-center gap-3">
            <span>License #TX-ROOF-9941</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-800">$2,000,000 General Liability Insured</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-700" /> {companyPhone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-emerald-700" /> {companyEmail}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Official Roof Proposal & Agreement
          </span>
          <span className="text-xl font-black font-mono text-emerald-700 block">{quote.id}</span>
          <span className="text-xs text-slate-600 block mt-0.5">
            Date: {new Date(quote.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-800 border border-slate-300">
            {quote.status === 'deposit_paid' ? 'Deposit Paid & Scheduled' : quote.signatureDataUrl ? 'Signed by Client' : 'Pending Client Acceptance'}
          </span>
        </div>
      </div>

      {/* 2. Client & Property Summary */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3 text-emerald-700" /> Property Owner / Client
          </h4>
          <p className="font-bold text-sm text-slate-900">{quote.customer.name}</p>
          <p className="text-slate-700 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400" /> {quote.customer.phone}
          </p>
          {quote.customer.email && (
            <p className="text-slate-700 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {quote.customer.email}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-700" /> Jobsite Installation Address
          </h4>
          <p className="font-bold text-sm text-slate-900">{quote.customer.address}</p>
          <p className="text-slate-700">
            {quote.customer.city}, {quote.customer.state} {quote.customer.zip}
          </p>
          <p className="text-slate-500 text-[11px] mt-1">
            Assigned Estimator: {quote.technician.name} ({quote.technician.role})
          </p>
        </div>
      </div>

      {/* 3. Roof Geometry & Technical Specifications */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
          1. Roof Measurements & Material Estimates
        </h3>
        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2 px-3 text-left">Ground Footprint</th>
              <th className="py-2 px-3 text-left">Roof Pitch</th>
              <th className="py-2 px-3 text-left">Waste Allowance</th>
              <th className="py-2 px-3 text-left">Total Squares</th>
              <th className="py-2 px-3 text-left">Shingle Bundles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            <tr>
              <td className="py-2 px-3 font-mono">{quote.calculation.groundSqFt.toLocaleString()} sq ft</td>
              <td className="py-2 px-3 font-bold">{quote.calculation.pitch}</td>
              <td className="py-2 px-3">{quote.calculation.wastePercent}%</td>
              <td className="py-2 px-3 font-bold font-mono text-emerald-800 text-sm">
                {quote.calculation.totalSquares.toFixed(1)} SQ
              </td>
              <td className="py-2 px-3 font-mono font-semibold">{quote.calculation.bundleCount} Bundles</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Selected Shingle Package */}
      <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Selected Shingle System & Warranty
            </span>
            <h4 className="text-base font-black text-slate-900">{selectedTier.name}</h4>
            <p className="text-xs text-slate-700 font-semibold">{selectedTier.brand}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 font-mono">
              ${selectedTier.pricePerSquare} / Square
            </span>
            <p className="text-[11px] text-emerald-700 font-bold">{selectedTier.warranty}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-700 mt-2 pt-2 border-t border-emerald-200/60">
          {selectedTier.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Itemized Scope of Work & Protection Upgrades */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
          2. Itemized Protection Upgrades & Accessories
        </h3>
        <table className="w-full text-xs border border-slate-200">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-1.5 px-3 text-left">Item Description</th>
              <th className="py-1.5 px-3 text-left">Application</th>
              <th className="py-1.5 px-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {activeAddons.length > 0 ? (
              activeAddons.map((addon) => {
                const itemTotal =
                  addon.unit === 'per_square' ? addon.price * quote.calculation.totalSquares : addon.price;
                return (
                  <tr key={addon.id}>
                    <td className="py-1.5 px-3 font-semibold">{addon.name}</td>
                    <td className="py-1.5 px-3 text-slate-600 text-[11px]">{addon.description}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold">
                      ${Math.round(itemTotal).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-2 px-3 text-slate-500 italic text-center">
                  Standard roofing scope with base underlayment and starter strip included.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 6. Financial Summary & Deposit Terms */}
      <div className="mb-6 border-t-2 border-slate-300 pt-3">
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Shingle System Subtotal:</span>
              <span className="font-mono font-semibold">
                ${Math.round(selectedTier.pricePerSquare * quote.calculation.totalSquares).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Accessories & Upgrades:</span>
              <span className="font-mono font-semibold">
                $
                {Math.round(
                  activeAddons.reduce(
                    (sum, a) => sum + (a.unit === 'per_square' ? a.price * quote.calculation.totalSquares : a.price),
                    0
                  )
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Texas State Sales Tax (8.25%):</span>
              <span className="font-mono font-semibold">${quote.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-1.5">
              <span>Total Project Value:</span>
              <span className="font-mono text-emerald-800">${quote.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-900 bg-emerald-50 p-2 rounded-lg border border-emerald-300 mt-2">
              <span>Earnest Deposit ({quote.depositPercent}%):</span>
              <span className="font-mono">${quote.depositAmount.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-500 text-right">
              Balance of ${(quote.total - quote.depositAmount).toFixed(2)} due upon city inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Client Authorization & E-Signature Block */}
      <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 page-break-inside-avoid">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
          Client Authorization & Acceptance
        </h4>
        <p className="text-[11px] text-slate-600 leading-relaxed mb-4">
          I hereby authorize {companyName} to furnish materials and labor in accordance with the specifications outlined above. 
          Upon receipt of the initial materials deposit, the project will be placed on the active production schedule. 
          Workmanship is backed by our full contractor warranty.
        </p>

        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Homeowner / Authorized Agent Signature</span>
            {quote.signatureDataUrl ? (
              <div className="border border-slate-300 rounded-lg p-2 bg-white h-20 flex items-center justify-center">
                <img src={quote.signatureDataUrl} alt="Signature" className="max-h-16 object-contain" />
              </div>
            ) : (
              <div className="border-b-2 border-slate-400 h-16 flex items-end pb-1 text-slate-400 italic">
                X _______________________________________
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-800 mt-1.5">
              Signed By: {quote.signedByName || quote.customer.name}
            </p>
            <p className="text-[10px] text-slate-500">
              Date: {quote.signedAt ? new Date(quote.signedAt).toLocaleString() : 'Pending'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Contractor Representative Acceptance</span>
            <div className="border-b-2 border-slate-400 h-16 flex items-end pb-1 text-slate-700 font-serif font-bold text-lg">
              Marcus Vance (Lead Estimator)
            </div>
            <p className="text-[11px] font-bold text-slate-800 mt-1.5">Apex Roofing & Restoration Representative</p>
            <p className="text-[10px] text-slate-500">
              Date: {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Legal Notice */}
      <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
        {companyName} &bull; {companyPhone} &bull; {companyEmail} &bull; Proposal #{quote.id} &bull; Page 1 of 1
      </div>
    </div>
  );
};
