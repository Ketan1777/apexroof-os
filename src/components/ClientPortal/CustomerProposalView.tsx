import React, { useState } from 'react';
import { ShieldCheck, Check, Phone, MapPin, Share2, CreditCard, ArrowLeft, Printer, DollarSign, Sparkles } from 'lucide-react';
import { Quote, ShingleTierId } from '../../types';
import { SHINGLE_TIERS } from '../../data/seedData';
import { TierSelector } from '../Estimator/TierSelector';
import { SatelliteRoofViewer } from '../Estimator/SatelliteRoofViewer';
import { SignaturePad } from '../Signature/SignaturePad';
import { StripeCheckoutModal } from '../Payment/StripeCheckoutModal';
import { HomeownerFinancingModal } from '../Payment/HomeownerFinancingModal';

interface CustomerProposalViewProps {
  quote: Quote;
  onUpdateQuote: (updated: Quote) => void;
  onBackToApp?: () => void;
  stripePaymentLink?: string;
}

export const CustomerProposalView: React.FC<CustomerProposalViewProps> = ({
  quote,
  onUpdateQuote,
  onBackToApp,
  stripePaymentLink,
}) => {
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [isFinancingOpen, setIsFinancingOpen] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const selectedTier = SHINGLE_TIERS[quote.selectedTier];

  const handleTierChange = (tierId: ShingleTierId) => {
    const tier = SHINGLE_TIERS[tierId];
    const shingleSubtotal = tier.pricePerSquare * quote.calculation.totalSquares;
    const addonsSubtotal = quote.addons
      .filter((a) => a.selected)
      .reduce(
        (sum, a) =>
          sum + (a.unit === 'per_square' ? a.price * quote.calculation.totalSquares : a.price),
        0
      );
    const subtotal = shingleSubtotal + addonsSubtotal;
    const tax = subtotal * 0.0825;
    const total = subtotal + tax;
    const depositAmount = (total * quote.depositPercent) / 100;

    onUpdateQuote({
      ...quote,
      selectedTier: tierId,
      subtotal,
      tax,
      total,
      depositAmount,
    });
  };

  const handleSignatureSave = (signatureDataUrl: string, signerName: string) => {
    onUpdateQuote({
      ...quote,
      signatureDataUrl,
      signedByName: signerName,
      signedAt: new Date().toLocaleString(),
      status: quote.status === 'deposit_paid' ? 'deposit_paid' : 'quoted',
    });
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setIsStripeOpen(false);
    onUpdateQuote({
      ...quote,
      status: 'deposit_paid',
      stripePaymentIntentId: paymentIntentId,
      depositPaidAt: new Date().toLocaleString(),
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in">
      {/* Top Banner Navigation */}
      {onBackToApp && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Field App
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">Verified Customer Proposal</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors border border-slate-700"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              {copyToast ? 'Link Copied!' : 'Share SMS Link'}
            </button>
          </div>
        </div>
      )}

      {/* Header & Contractor Identity */}
      <div className="bg-gradient-to-br from-[#0c1813] via-slate-900 to-slate-950 border border-emerald-950/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-widest uppercase text-emerald-400">
                Official Verified Roof Restoration Proposal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Apex Roofing & Restoration
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Austin, TX &bull; Lic #TX-ROOF-9941</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> \$2M General Liability Insured
              </span>
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Proposal Number</span>
            <span className="text-lg font-mono font-black text-emerald-400">{quote.id}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Guaranteed Pricing &bull; {new Date(quote.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Customer & Project Address Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Prepared For Property Owner
            </span>
            <h4 className="text-base font-bold text-white">{quote.customer.name}</h4>
            <div className="text-xs text-slate-300 space-y-0.5 mt-1.5">
              <p className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {quote.customer.address}, {quote.customer.city}, {quote.customer.state} {quote.customer.zip}
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> {quote.customer.phone}
              </p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Field Estimator & Assigned Crew
            </span>
            <div className="flex items-center gap-3">
              <img
                src={quote.technician.avatar}
                alt={quote.technician.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <h5 className="text-sm font-bold text-white">{quote.technician.name}</h5>
                <p className="text-xs text-emerald-400 font-medium">{quote.technician.role}</p>
                <p className="text-[11px] text-slate-400">{quote.technician.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite Roof Aerial View */}
      <SatelliteRoofViewer
        address={quote.customer.address}
        city={quote.customer.city}
        state={quote.customer.state}
        zip={quote.customer.zip}
        totalSquares={quote.calculation.totalSquares}
        groundSqFt={quote.calculation.groundSqFt}
        onAddressChange={(newAddr) => {
          onUpdateQuote({
            ...quote,
            customer: {
              ...quote.customer,
              ...newAddr,
            },
          });
        }}
      />

      {/* Interactive Good / Better / Best Shingle Tier Picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <TierSelector
          selectedTier={quote.selectedTier}
          onSelectTier={handleTierChange}
          totalSquares={quote.calculation.totalSquares}
        />
      </div>

      {/* Scope of Work & Selected Add-ons */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Selected Protection & Accessories
        </h3>
        <div className="space-y-3">
          {quote.addons
            .filter((a) => a.selected)
            .map((addon) => {
              const itemPrice =
                addon.unit === 'per_square' ? addon.price * quote.calculation.totalSquares : addon.price;
              return (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-sm font-bold text-white block">{addon.name}</span>
                      <span className="text-xs text-slate-400">{addon.description}</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">
                    ${Math.round(itemPrice).toLocaleString()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Photos & Damage Report */}
      {quote.photos.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
            Roof Damage Inspection Evidence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quote.photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950"
              >
                <img src={photo.url} alt={photo.label} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <span className="text-[10px] uppercase font-bold text-red-400 block mb-0.5">
                    {photo.severity} Priority Finding
                  </span>
                  <h5 className="text-xs font-bold text-white">{photo.label}</h5>
                  <p className="text-[11px] text-slate-400 mt-1">{photo.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Investment Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Investment Summary & Payment Schedule
        </h3>

        <div className="space-y-2.5 mb-6 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>
              {selectedTier.name} System ({quote.calculation.totalSquares.toFixed(1)} Squares)
            </span>
            <span className="font-mono text-slate-200">
              ${Math.round(selectedTier.pricePerSquare * quote.calculation.totalSquares).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Protection Add-ons & Flashing Upgrades</span>
            <span className="font-mono text-slate-200">
              $
              {Math.round(
                quote.addons
                  .filter((a) => a.selected)
                  .reduce(
                    (s, a) =>
                      s + (a.unit === 'per_square' ? a.price * quote.calculation.totalSquares : a.price),
                    0
                  )
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Texas State & Municipal Sales Tax (8.25%)</span>
            <span className="font-mono text-slate-200">
              ${quote.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Roof Replacement
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1">
                  ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Includes labor, tear-off, {selectedTier.name} shingles & warranty
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Earnest Deposit Due
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {quote.depositAmount === 1000 ? 'Flat $1k' : `${quote.depositPercent}%`}
                  </span>
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  ${quote.depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Secures production slot & initial material delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Homeowner Financing Option Card (Beat ApexOS feature) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Flexible Monthly Roof Financing Available
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                  $0 Down
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Plans as low as <strong className="text-emerald-400 font-mono">${Math.round((quote.total * (1 + 0.0899 * 5)) / 60)}/mo</strong> or 0% APR for 12 months &bull; Soft credit check
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFinancingOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Explore Monthly Financing</span>
          </button>
        </div>

        {/* Deposit Schedule Action Banner */}
        <div className="bg-[#081510] p-5 sm:p-6 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-emerald-950/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Stage 1 Booking Deposit
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Balance due upon final building inspection and magnet nail sweep.
            </p>
          </div>

          <div className="w-full sm:w-auto">
            {quote.status === 'deposit_paid' ? (
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-400" /> Deposit Received & Scheduled
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (stripePaymentLink) {
                    window.open(stripePaymentLink, '_blank');
                  } else {
                    setIsStripeOpen(true);
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
                <span>Pay Deposit (${Math.round(quote.depositAmount).toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <SignaturePad
        onSave={handleSignatureSave}
        initialSignerName={quote.signedByName || quote.customer.name}
        isCompleted={Boolean(quote.signatureDataUrl)}
        existingSignatureUrl={quote.signatureDataUrl}
      />

      {/* Stripe Modal */}
      <StripeCheckoutModal
        quote={quote}
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Homeowner Financing Modal */}
      <HomeownerFinancingModal
        quote={quote}
        isOpen={isFinancingOpen}
        onClose={() => setIsFinancingOpen(false)}
      />
    </div>
  );
};
