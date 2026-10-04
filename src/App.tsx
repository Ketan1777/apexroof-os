import React, { useState, useEffect } from 'react';
import { Quote, Technician, SmsMessage } from './types';
import {
  INITIAL_QUOTES,
  INITIAL_TECHNICIANS,
  INITIAL_SMS_LOG,
  DEFAULT_ADDONS,
} from './data/seedData';
import { Navbar, AppView } from './components/Navbar';
import { FieldEstimatorView } from './components/Estimator/FieldEstimatorView';
import { DispatcherBoard } from './components/Dispatch/DispatcherBoard';
import { CustomerProposalView } from './components/ClientPortal/CustomerProposalView';
import { SmsNotificationDrawer } from './components/SMS/SmsNotificationDrawer';
import {
  ContractorBillingModal,
  ContractorSettings,
} from './components/Settings/ContractorBillingModal';
import { isCloudConfigured, syncQuoteToCloud } from './lib/supabase';

const DEFAULT_SETTINGS: ContractorSettings = {
  companyName: 'Apex Roofing & Restoration',
  phone: '(512) 842-9912',
  email: 'owner@apexroofaustin.com',
  currentPlan: 'starter',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  stripePaymentLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK || '',
  depositMode: '10_percent',
  testMode: true,
};

export function App() {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('apex_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [activeQuoteId, setActiveQuoteId] = useState<string>(() => {
    return quotes[0]?.id || INITIAL_QUOTES[0].id;
  });

  const [technicians] = useState<Technician[]>(INITIAL_TECHNICIANS);

  const [smsLog, setSmsLog] = useState<SmsMessage[]>(() => {
    const saved = localStorage.getItem('apex_sms_log');
    return saved ? JSON.parse(saved) : INITIAL_SMS_LOG;
  });

  const [settings, setSettings] = useState<ContractorSettings>(() => {
    const saved = localStorage.getItem('apex_contractor_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentView, setCurrentView] = useState<AppView>('estimator');
  const [isSmsDrawerOpen, setIsSmsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync quotes to localStorage & Supabase cloud
  useEffect(() => {
    localStorage.setItem('apex_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('apex_sms_log', JSON.stringify(smsLog));
  }, [smsLog]);

  useEffect(() => {
    localStorage.setItem('apex_contractor_settings', JSON.stringify(settings));
  }, [settings]);

  const activeQuote = quotes.find((q) => q.id === activeQuoteId) || quotes[0];

  const handleUpdateQuote = (updated: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    // Asynchronously sync to Supabase if configured
    syncQuoteToCloud(updated);
  };

  const handleCreateNewQuote = () => {
    const nextNum = Math.floor(8800 + Math.random() * 1000);
    const newQuote: Quote = {
      id: `QT-${nextNum}`,
      jobId: `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer: {
        id: `cust_${Date.now()}`,
        name: 'New Homeowner',
        phone: '(512) 555-0100',
        email: 'homeowner@austin.net',
        address: '1204 Highland Valley Rd',
        city: 'Austin',
        state: 'TX',
        zip: '78746',
      },
      technician: technicians[0],
      calculation: {
        groundSqFt: 2200,
        pitch: '6/12',
        wastePercent: 12,
        stories: 1,
        rawSquares: 24.64,
        totalSquares: 27.6,
        bundleCount: 83,
      },
      selectedTier: 'better',
      addons: DEFAULT_ADDONS.map((a) => ({
        ...a,
        selected: a.id === 'tear_off' || a.id === 'ice_water' || a.id === 'ridge_vent',
      })),
      photos: [],
      subtotal: 16120,
      tax: 1329.9,
      total: 17449.9,
      depositPercent: 10,
      depositAmount: 1744.99,
      status: 'inspecting',
      createdAt: new Date().toISOString(),
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setActiveQuoteId(newQuote.id);
    setCurrentView('estimator');
    syncQuoteToCloud(newQuote);
  };

  const handleSendSms = (newSms: SmsMessage) => {
    setSmsLog((prev) => [newSms, ...prev]);
    setIsSmsDrawerOpen(true);
  };

  const planLabel =
    settings.currentPlan === 'starter'
      ? 'Solo ($49/mo)'
      : settings.currentPlan === 'pro'
      ? 'Pro ($129/mo)'
      : 'Empire ($249/mo)';

  return (
    <div className="min-h-screen bg-[#08100d] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar & View Switcher */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        smsCount={smsLog.length}
        onOpenSmsDrawer={() => setIsSmsDrawerOpen(true)}
        onNewQuote={handleCreateNewQuote}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentPlanName={planLabel}
        isCloudActive={isCloudConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentView === 'estimator' && activeQuote && (
          <FieldEstimatorView
            quote={activeQuote}
            onUpdateQuote={handleUpdateQuote}
            onPresentToClient={() => setCurrentView('customer_preview')}
            onSendSms={handleSendSms}
            stripePaymentLink={settings.stripePaymentLink}
          />
        )}

        {currentView === 'customer_preview' && activeQuote && (
          <CustomerProposalView
            quote={activeQuote}
            onUpdateQuote={handleUpdateQuote}
            onBackToApp={() => setCurrentView('estimator')}
            stripePaymentLink={settings.stripePaymentLink}
          />
        )}

        {currentView === 'dispatch' && (
          <DispatcherBoard
            quotes={quotes}
            technicians={technicians}
            onOpenQuote={(q) => {
              setActiveQuoteId(q.id);
              setCurrentView('estimator');
            }}
            onSendSms={handleSendSms}
          />
        )}
      </main>

      {/* Live SMS Stream Drawer */}
      <SmsNotificationDrawer
        isOpen={isSmsDrawerOpen}
        onClose={() => setIsSmsDrawerOpen(false)}
        messages={smsLog}
      />

      {/* Contractor Settings & Subscription Modal */}
      <ContractorBillingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}

export default App;
