import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Send,
  Eye,
  CreditCard,
  PenTool,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Printer,
  Percent,
  Package,
  ShieldAlert,
  Satellite,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Quote, ShingleTierId, RoofCalculation, InspectionPhoto, SmsMessage } from '../../types';
import { SHINGLE_TIERS, PITCH_CONFIGS } from '../../data/seedData';
import { PitchAndSquaresCalculator } from './PitchAndSquaresCalculator';
import { TierSelector } from './TierSelector';
import { AddonSelector } from './AddonSelector';
import { InspectionPhotos } from './InspectionPhotos';
import { SatelliteRoofViewer } from './SatelliteRoofViewer';
import { JobCostingMeter } from './JobCostingMeter';
import { SignaturePad } from '../Signature/SignaturePad';
import { StripeCheckoutModal } from '../Payment/StripeCheckoutModal';
import { HomeownerFinancingModal } from '../Payment/HomeownerFinancingModal';
import { SendSmsModal } from '../SMS/SendSmsModal';
import { MaterialOrderModal } from '../Suppliers/MaterialOrderModal';
import { InsuranceSupplementModal } from '../Insurance/InsuranceSupplementModal';

interface FieldEstimatorViewProps {
  quote: Quote;
  onUpdateQuote: (quote: Quote) => void;
  onPresentToClient: () => void;
  onSendSms: (sms: SmsMessage) => void;
  stripePaymentLink?: string;
}

export const FieldEstimatorView: React.FC<FieldEstimatorViewProps> = ({
  quote,
  onUpdateQuote,
  onPresentToClient,
  onSendSms,
  stripePaymentLink,
}) => {
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isFinancingOpen, setIsFinancingOpen] = useState(false);
  const [showSatellite, setShowSatellite] = useState(true);

  // Local draft for customer text fields — updates instantly without triggering
  // a Supabase cloud write on every keystroke (zero-lag address typing fix)
  const [draftCustomer, setDraftCustomer] = useState(quote.customer);
  const customerDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync if parent quote changes externally (e.g. different quote selected)
  useEffect(() => {
    setDraftCustomer(quote.customer);
  }, [quote.id]);

  const handleCustomerFieldChange = (field: keyof typeof draftCustomer, value: string) => {
    const updated = { ...draftCustomer, [field]: value };
    setDraftCustomer(updated); // instant local update → no lag
    // Debounce propagation upwards (and to Supabase) by 600ms
    if (customerDebounceTimer.current) clearTimeout(customerDebounceTimer.current);
    customerDebounceTimer.current = setTimeout(() => {
      onUpdateQuote({ ...quote, customer: updated });
    }, 600);
  };

  const calculateTotals = (
    calculation: RoofCalculation,
    tierId: ShingleTierId,
    addons: typeof quote.addons,
    depositPct: number = quote.depositPercent
  ) => {
    const tier = SHINGLE_TIERS[tierId];
    const shingleSubtotal = tier.pricePerSquare * calculation.totalSquares;
    const addonsSubtotal = addons
      .filter((a) => a.selected)
      .reduce(
        (sum, a) =>
          sum + (a.unit === 'per_square' ? a.price * calculation.totalSquares : a.price),
        0
      );
    const subtotal = shingleSubtotal + addonsSubtotal;
    const tax = subtotal * 0.0825; // 8.25% standard sales tax
    const total = subtotal + tax;
    const depositAmount = (total * depositPct) / 100;

    return { subtotal, tax, total, depositPercent: depositPct, depositAmount };
  };

  const handleCalculationChange = (newCalc: RoofCalculation) => {
    const totals = calculateTotals(newCalc, quote.selectedTier, quote.addons);
    onUpdateQuote({
      ...quote,
      calculation: newCalc,
      ...totals,
    });
  };

  const handleTierSelect = (tierId: ShingleTierId) => {
    const totals = calculateTotals(quote.calculation, tierId, quote.addons);
    onUpdateQuote({
      ...quote,
      selectedTier: tierId,
      ...totals,
    });
  };

  const handleToggleAddon = (addonId: string) => {
    const updatedAddons = quote.addons.map((a) =>
      a.id === addonId ? { ...a, selected: !a.selected } : a
    );
    const totals = calculateTotals(quote.calculation, quote.selectedTier, updatedAddons);
    onUpdateQuote({
      ...quote,
      addons: updatedAddons,
      ...totals,
    });
  };

  const handleSetDepositMode = (percent: number, flatAmount?: number) => {
    const depositAmount = flatAmount !== undefined ? flatAmount : (quote.total * percent) / 100;
    onUpdateQuote({
      ...quote,
      depositPercent: percent,
      depositAmount,
    });
  };

  const handleAddPhoto = (photo: InspectionPhoto) => {
    onUpdateQuote({
      ...quote,
      photos: [photo, ...quote.photos],
    });
  };

  const handleRemovePhoto = (id: string) => {
    onUpdateQuote({
      ...quote,
      photos: quote.photos.filter((p) => p.id !== id),
    });
  };

  const handleSignatureSave = (signatureDataUrl: string, signerName: string) => {
    setShowSignatureModal(false);
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

  const smsDefaultText = `Apex Roofing: Hi ${quote.customer.name}! Estimator ${quote.technician.name} prepared your custom roof proposal for ${quote.customer.address} ($${Math.round(quote.total).toLocaleString()}). Review 3 shingle tiers & e-sign: https://apexroof.app/p/${quote.id}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 animate-in fade-in">
      {/* Property Owner Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Job & Property Scope #{quote.id}
              </h2>
              <p className="text-xs text-slate-400">Assigned: {quote.technician.name} ({quote.technician.role})</p>
            </div>
          </div>

          {/* Quick Trade Power Tools */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsMaterialModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Material Supply Order Sheet"
            >
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span>Material PO</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInsuranceModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Insurance Supplement (Xactimate)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Insurance Scope</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSatellite(!showSatellite)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showSatellite
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite Aerial</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Print or Export PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print / PDF</span>
            </button>

            <span
              className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                quote.status === 'deposit_paid'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              }`}
            >
              {quote.status.replace('_', ' ')}
            </span>
            {quote.signatureDataUrl && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <FileCheck className="w-3.5 h-3.5" /> Signed
              </span>
            )}
          </div>
        </div>

        {/* Customer fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-3">
            <label className="block text-slate-400 mb-1 font-medium">Homeowner Name</label>
            <input
              type="text"
              value={draftCustomer.name}
              onChange={(e) => handleCustomerFieldChange('name', e.target.value)}
              placeholder="e.g. Robert Miller"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">Cell Phone (SMS)</label>
            <input
              type="text"
              value={draftCustomer.phone}
              onChange={(e) => handleCustomerFieldChange('phone', e.target.value)}
              placeholder="(512) 555-0193"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-slate-400 mb-1 font-medium">Street Address</label>
            <input
              type="text"
              value={draftCustomer.address}
              onChange={(e) => handleCustomerFieldChange('address', e.target.value)}
              placeholder="4910 Whispering Valley Dr"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1 font-medium">City</label>
            <input
              type="text"
              value={draftCustomer.city}
              onChange={(e) => handleCustomerFieldChange('city', e.target.value)}
              placeholder="Austin"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">State</label>
              <input
                type="text"
                value={draftCustomer.state}
                onChange={(e) => handleCustomerFieldChange('state', e.target.value.toUpperCase())}
                placeholder="TX"
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 uppercase text-center"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">ZIP</label>
              <input
                type="text"
                value={draftCustomer.zip}
                onChange={(e) => handleCustomerFieldChange('zip', e.target.value)}
                placeholder="78759"
                className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Satellite Roof Aerial Viewer */}
      {showSatellite && (
        <SatelliteRoofViewer
          address={quote.customer.address}
          city={quote.customer.city}
          state={quote.customer.state}
          zip={quote.customer.zip}
          totalSquares={quote.calculation.totalSquares}
          groundSqFt={quote.calculation.groundSqFt}
          onApplyFootprint={(sqFt) => {
            const pitchMultiplier = PITCH_CONFIGS[quote.calculation.pitch]?.multiplier || 1.12;
            const storiesMultiplier = quote.calculation.stories === 2 ? 1.08 : quote.calculation.stories === 3 ? 1.16 : 1.0;
            const pitchAdjustedSqFt = sqFt * pitchMultiplier * storiesMultiplier;
            const rawSquares = pitchAdjustedSqFt / 100;
            const totalSquares = rawSquares * (1 + quote.calculation.wastePercent / 100);
            const bundleCount = Math.ceil(totalSquares * 3);
            handleCalculationChange({
              ...quote.calculation,
              groundSqFt: sqFt,
              rawSquares: Number(rawSquares.toFixed(2)),
              totalSquares: Number(totalSquares.toFixed(2)),
              bundleCount,
            });
          }}
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
      )}

      {/* 1. Roof Measurement Engine */}
      <PitchAndSquaresCalculator
        calculation={quote.calculation}
        onChange={handleCalculationChange}
      />

      {/* 2. Good / Better / Best Shingle Tiers */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <TierSelector
          selectedTier={quote.selectedTier}
          onSelectTier={handleTierSelect}
          totalSquares={quote.calculation.totalSquares}
        />
      </div>

      {/* 3. Roof Upgrades & Protection Add-ons */}
      <AddonSelector
        addons={quote.addons}
        totalSquares={quote.calculation.totalSquares}
        onToggleAddon={handleToggleAddon}
      />

      {/* 4. Flexible Deposit Policy Bar (Quick Selector) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Adjust Materials Deposit Requirement
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Pick a lower deposit amount to close hesitant homeowners immediately on the driveway.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full whitespace-nowrap">
            Active Deposit: ${Math.round(quote.depositAmount).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleSetDepositMode(Math.round((1000 / quote.total) * 100), 1000)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              quote.depositAmount === 1000
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-white">Flat $1,000 Lock</span>
              {quote.depositAmount === 1000 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>
            <span className="text-base font-black font-mono text-emerald-400">$1,000</span>
            <span className="text-[10px] text-slate-400 mt-1">Fastest driveway close</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetDepositMode(10)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              quote.depositPercent === 10 && quote.depositAmount !== 1000
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-white">10% Booking Hold</span>
              {quote.depositPercent === 10 && quote.depositAmount !== 1000 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>
            <span className="text-base font-black font-mono text-emerald-400">
              ${Math.round(quote.total * 0.1).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Standard booking hold</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetDepositMode(20)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              quote.depositPercent === 20 && quote.depositAmount !== 1000
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-white">20% Material Order</span>
              {quote.depositPercent === 20 && quote.depositAmount !== 1000 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>
            <span className="text-base font-black font-mono text-emerald-400">
              ${Math.round(quote.total * 0.2).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Direct supplier trigger</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetDepositMode(30)}
            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              quote.depositPercent === 30 && quote.depositAmount !== 1000
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-white">30% Standard Deposit</span>
              {quote.depositPercent === 30 && quote.depositAmount !== 1000 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </div>
            <span className="text-base font-black font-mono text-emerald-400">
              ${Math.round(quote.total * 0.3).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Full contract standard</span>
          </button>
        </div>
      </div>

      {/* 5. Damage Inspection Photos */}
      <InspectionPhotos
        photos={quote.photos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
      />

      {/* 6. Contractor Profit Margin & Job Costing Meter (Outperforms ApexOS) */}
      <JobCostingMeter quote={quote} />

      {/* Signature Section Modal / Inline */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full">
            <SignaturePad
              onSave={handleSignatureSave}
              initialSignerName={quote.signedByName || quote.customer.name}
              isCompleted={Boolean(quote.signatureDataUrl)}
              existingSignatureUrl={quote.signatureDataUrl}
            />
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close without saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Field Action Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#08130f]/95 backdrop-blur-md border-t border-emerald-950/70 py-3 px-4 sm:px-6 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Symmetrical Price & Deposit Metric Badges */}
          <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 min-w-[155px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Estimate ({quote.calculation.totalSquares.toFixed(1)} SQ)
              </span>
              <span className="text-lg sm:text-xl font-black text-white font-mono leading-tight">
                ${Math.round(quote.total).toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl px-4 py-2 min-w-[155px]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Deposit Required
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-300 font-mono leading-tight">
                ${Math.round(quote.depositAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setIsSmsModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>SMS Link</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFinancingOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              title="Homeowner Monthly Financing Calculator"
            >
              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              <span>Financing</span>
            </button>

            <button
              type="button"
              onClick={onPresentToClient}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-750 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>Present to Client</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSignatureModal(true)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              <span>{quote.signatureDataUrl ? 'Signed ✓' : 'E-Sign'}</span>
            </button>

            {quote.status === 'deposit_paid' ? (
              <div className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Deposit Paid
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
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Collect Deposit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Native / Cloud SMS Modal */}
      <SendSmsModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        phone={quote.customer.phone}
        recipientName={quote.customer.name}
        defaultMessage={smsDefaultText}
        onSendCloudSms={(sms) => onSendSms(sms)}
      />

      {/* Material Order Modal (ABC Supply / Beacon) */}
      <MaterialOrderModal
        quote={quote}
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
      />

      {/* Insurance Supplement Modal (Xactimate) */}
      <InsuranceSupplementModal
        quote={quote}
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
      />

      {/* Stripe Modal */}
      <StripeCheckoutModal
        quote={quote}
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        stripePaymentLink={stripePaymentLink}
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
