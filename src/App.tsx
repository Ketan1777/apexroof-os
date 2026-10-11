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
import { AuthModal } from './components/Auth/AuthModal';
import {
  isCloudConfigured,
  syncQuoteToCloud,
  fetchQuotesFromCloud,
  subscribeToQuotes,
  getCurrentAuthUser,
} from './lib/supabase';

const DEFAULT_SETTINGS: ContractorSettings = {
  companyName: 'Apex Roofing & Restoration',
  phone: '(512) 842-9912',
  email: 'owner@apexroofaustin.com',
  currentPlan: 'starter',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  stripePaymentLink: import.meta.env.VITE_STRIPE_PAYMENT_LINK || '',
  depositMode: '10_percent',
  testMode: true,
  supabaseUrl: localStorage.getItem('apex_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: localStorage.getItem('apex_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
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
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('apex_user_email') || null;
  });
  const [cloudActive, setCloudActive] = useState<boolean>(isCloudConfigured());

  // Check existing session
  useEffect(() => {
    getCurrentAuthUser().then((user) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
        localStorage.setItem('apex_user_email', user.email);
      }
    });
  }, []);

  // Cloud Database: fetch quotes and enable realtime websocket subscription
  useEffect(() => {
    const configured = isCloudConfigured();
    setCloudActive(configured);

    if (configured) {
      // 1. Fetch cloud quotes from Supabase
      fetchQuotesFromCloud().then(({ quotes: cloudQuotes, error }) => {
        if (cloudQuotes && cloudQuotes.length > 0) {
          setQuotes(cloudQuotes);
        } else if (cloudQuotes && cloudQuotes.length === 0) {
          // Empty table, seed initial sample quotes to cloud
          INITIAL_QUOTES.forEach((q) => syncQuoteToCloud(q));
        } else if (error) {
          console.warn('[Supabase Cloud Notice]:', error);
        }
      });

      // 2. Subscribe to realtime PostgreSQL changes across devices
      const unsubscribe = subscribeToQuotes((updatedQuote) => {
        setQuotes((prev) => {
          const exists = prev.some((q) => q.id === updatedQuote.id);
          if (exists) {
            return prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q));
          }
          return [updatedQuote, ...prev];
        });
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [settings]);

  // Sync quotes to localStorage as offline safety backup
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
    // Sync to Supabase PostgreSQL cloud table
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
      addons: DEFAULT_ADDONS.map((a) => ({ ...a, selected: a.id === 'vent' })),
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

  const handleSyncAllQuotes = async (): Promise<number> => {
    let count = 0;
    for (const q of quotes) {
      const res = await syncQuoteToCloud(q);
      if (res.success) count++;
    }
    return count;
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
        isCloudActive={cloudActive}
        currentUserEmail={currentUserEmail}
        onOpenAuth={() => setIsAuthOpen(true)}
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

      {/* Contractor Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUserEmail={currentUserEmail}
        onAuthSuccess={(email, compName) => {
          setCurrentUserEmail(email);
          localStorage.setItem('apex_user_email', email);
          if (compName) {
            setSettings((prev) => ({ ...prev, companyName: compName }));
          }
        }}
        onLogoutSuccess={() => {
          setCurrentUserEmail(null);
          localStorage.removeItem('apex_user_email');
        }}
      />

      {/* Contractor Settings, Cloud Database & Billing Modal */}
      <ContractorBillingModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onSyncAllQuotes={handleSyncAllQuotes}
      />
    </div>
  );
}

export default App;
