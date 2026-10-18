import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Quote,
  Technician,
  SmsMessage,
  Lead,
  RoofingJob,
  Invoice,
  CrewScheduleItem,
} from './types';
import {
  INITIAL_QUOTES,
  INITIAL_TECHNICIANS,
  INITIAL_SMS_LOG,
  INITIAL_LEADS,
  INITIAL_JOBS,
  INITIAL_INVOICES,
  INITIAL_CREW_SCHEDULES,
  DEFAULT_ADDONS,
} from './data/seedData';
import { Navbar, AppView } from './components/Navbar';
import { FieldEstimatorView } from './components/Estimator/FieldEstimatorView';
import { DispatcherBoard } from './components/Dispatch/DispatcherBoard';
import { CustomerProposalView } from './components/ClientPortal/CustomerProposalView';
import { LeadPipelineView } from './components/CRM/LeadPipelineView';
import { JobLifecycleView } from './components/Jobs/JobLifecycleView';
import { InvoicesView } from './components/Invoicing/InvoicesView';
import { SmsNotificationDrawer } from './components/SMS/SmsNotificationDrawer';
import {
  ContractorBillingModal,
  ContractorSettings,
} from './components/Settings/ContractorBillingModal';
import { AuthModal } from './components/Auth/AuthModal';
import { PrintableProposalDocument } from './components/Print/PrintableProposalDocument';
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
  // Quotes state
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('apex_quotes');
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [activeQuoteId, setActiveQuoteId] = useState<string>(() => {
    return quotes[0]?.id || INITIAL_QUOTES[0].id;
  });

  // CRM Leads state (Priority 1)
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('apex_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  // Jobs Lifecycle state (Priority 2)
  const [jobs, setJobs] = useState<RoofingJob[]>(() => {
    const saved = localStorage.getItem('apex_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  // Invoices & Accounting state (Priority 3)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('apex_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // Crew Schedules state (Priority 4)
  const [crewSchedules, setCrewSchedules] = useState<CrewScheduleItem[]>(() => {
    const saved = localStorage.getItem('apex_crew_schedules');
    return saved ? JSON.parse(saved) : INITIAL_CREW_SCHEDULES;
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

  const [currentView, setCurrentView] = useState<AppView>('crm');
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
      fetchQuotesFromCloud().then(({ quotes: cloudQuotes, error }) => {
        if (cloudQuotes && cloudQuotes.length > 0) {
          setQuotes(cloudQuotes);
        } else if (cloudQuotes && cloudQuotes.length === 0) {
          INITIAL_QUOTES.forEach((q) => syncQuoteToCloud(q));
        } else if (error) {
          console.warn('[Supabase Cloud Notice]:', error);
        }
      });

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

  // Offline persistence
  useEffect(() => {
    localStorage.setItem('apex_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('apex_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('apex_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('apex_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('apex_crew_schedules', JSON.stringify(crewSchedules));
  }, [crewSchedules]);

  useEffect(() => {
    localStorage.setItem('apex_sms_log', JSON.stringify(smsLog));
  }, [smsLog]);

  useEffect(() => {
    localStorage.setItem('apex_contractor_settings', JSON.stringify(settings));
  }, [settings]);

  const activeQuote = quotes.find((q) => q.id === activeQuoteId) || quotes[0];

  // Debounce timer ref — prevents Supabase from firing on every keystroke
  const cloudSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdateQuote = useCallback((updated: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));

    // Debounce the Supabase cloud sync
    if (cloudSyncTimer.current) clearTimeout(cloudSyncTimer.current);
    cloudSyncTimer.current = setTimeout(() => {
      syncQuoteToCloud(updated);
    }, 800);

    // If quote deposit is paid, auto-update/create Job and set Lead to won! (End-to-End Workflow Integration)
    if (updated.status === 'deposit_paid') {
      setJobs((prevJobs) => {
        const existing = prevJobs.find((j) => j.quoteId === updated.id);
        if (existing) {
          return prevJobs.map((j) =>
            j.quoteId === updated.id
              ? {
                  ...j,
                  depositPaid: updated.depositAmount,
                  remainingBalance: updated.total - updated.depositAmount,
                  stage: j.stage === 'quote_approved' ? 'deposit_received' : j.stage,
                }
              : j
          );
        } else {
          const newJob: RoofingJob = {
            id: `job_rec_${Date.now()}`,
            jobId: updated.jobId,
            quoteId: updated.id,
            customer: updated.customer,
            stage: 'deposit_received',
            assignedCrewId: updated.technician.id,
            assignedCrewName: updated.technician.name,
            scheduledStartDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            scheduledEndDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
            shingleTier: updated.selectedTier.toUpperCase(),
            totalSquares: updated.calculation.totalSquares,
            contractAmount: updated.total,
            depositPaid: updated.depositAmount,
            remainingBalance: updated.total - updated.depositAmount,
            materialCost: Math.round(updated.calculation.totalSquares * 135),
            laborCost: Math.round(updated.calculation.totalSquares * 85),
            dumpsterPermitCost: 800,
            grossProfit: Math.round(
              updated.total -
                (updated.calculation.totalSquares * 220 + 800)
            ),
            marginPercent: 52.0,
            notes: `Contract accepted and deposit collected. Shingle tier: ${updated.selectedTier}`,
            createdAt: new Date().toISOString(),
          };
          return [newJob, ...prevJobs];
        }
      });

      // Mark matching lead as won
      setLeads((prevLeads) =>
        prevLeads.map((l) =>
          l.quoteId === updated.id || l.phone === updated.customer.phone
            ? { ...l, stage: 'won' as const, quoteId: updated.id }
            : l
        )
      );
    }
  }, []);

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
        groundSqFt: 2400,
        pitch: '6/12',
        wastePercent: 12,
        stories: 1,
        rawSquares: 26.88,
        totalSquares: 30.1,
        bundleCount: 91,
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

  // Convert CRM Lead directly to Roof Quote (Priority 1 Core Workflow Integration)
  const handleConvertToQuoteFromLead = (lead: Lead) => {
    // Check if an existing quote belongs to this lead
    const existing = quotes.find((q) => q.id === lead.quoteId || q.customer.phone === lead.phone);
    if (existing) {
      setActiveQuoteId(existing.id);
      setCurrentView('estimator');
      return;
    }

    // Create a new customized quote pre-filled with the lead's exact information
    const nextNum = Math.floor(8800 + Math.random() * 1000);
    const newQuote: Quote = {
      id: `QT-${nextNum}`,
      jobId: `JOB-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer: {
        id: `cust_${Date.now()}`,
        name: lead.customerName,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip: lead.zip,
      },
      technician: technicians[0],
      calculation: {
        groundSqFt: 2400,
        pitch: '6/12',
        wastePercent: 12,
        stories: 1,
        rawSquares: 26.88,
        totalSquares: 30.1,
        bundleCount: 91,
      },
      selectedTier: 'better',
      addons: DEFAULT_ADDONS.map((a) => ({ ...a, selected: a.selected })),
      photos: [],
      subtotal: 17690,
      tax: 1459.42,
      total: 19149.42,
      depositPercent: 10,
      depositAmount: 1914.94,
      status: 'quoted',
      createdAt: new Date().toISOString(),
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setActiveQuoteId(newQuote.id);

    // Update lead with quoteId and stage
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              quoteId: newQuote.id,
              stage: l.stage === 'new' || l.stage === 'contacted' ? 'quote_sent' : l.stage,
            }
          : l
      )
    );

    setCurrentView('estimator');
    syncQuoteToCloud(newQuote);
  };

  // Convert Completed / Active Job into an Official Invoice (Priority 2 & 3 Integration)
  const handleGenerateInvoiceFromJob = (job: RoofingJob) => {
    // Check if invoice already exists for this job
    const existing = invoices.find((inv) => inv.jobId === job.jobId);
    if (existing) {
      setCurrentView('invoices');
      return;
    }

    const nextInvNum = Math.floor(1000 + invoices.length + 1);
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-${nextInvNum}`,
      jobId: job.jobId,
      quoteId: job.quoteId,
      customer: job.customer,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item_1',
          description: `Complete Roof Replacement (${job.shingleTier}, ${job.totalSquares} SQ)`,
          quantity: job.totalSquares,
          unitPrice: Math.round(job.contractAmount / job.totalSquares),
          total: job.contractAmount,
        },
      ],
      subtotal: Math.round(job.contractAmount / 1.0825),
      tax: Math.round(job.contractAmount - job.contractAmount / 1.0825),
      total: job.contractAmount,
      depositPaid: job.depositPaid,
      amountDue: job.remainingBalance,
      status: job.remainingBalance <= 0 ? 'paid' : job.depositPaid > 0 ? 'deposit_applied' : 'sent',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update job stage to invoiced if completed
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, stage: 'invoiced' as const } : j))
    );

    setCurrentView('invoices');
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateJob = (updated: RoofingJob) => {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  };

  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  const handleCreateInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
  };

  const handleUpdateScheduleStatus = (id: string, status: 'scheduled' | 'in_progress' | 'completed') => {
    setCrewSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
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
        {/* Module 1: CRM & Sales Pipeline (Priority 1) */}
        {currentView === 'crm' && (
          <LeadPipelineView
            leads={leads}
            onUpdateLead={handleUpdateLead}
            onAddLead={handleAddLead}
            onConvertToQuote={handleConvertToQuoteFromLead}
          />
        )}

        {/* Module 2: Field Estimator */}
        {currentView === 'estimator' && activeQuote && (
          <FieldEstimatorView
            quote={activeQuote}
            onUpdateQuote={handleUpdateQuote}
            onPresentToClient={() => setCurrentView('customer_preview')}
            onSendSms={handleSendSms}
            stripePaymentLink={settings.stripePaymentLink}
          />
        )}

        {/* Module 3: Job Lifecycle & Operations (Priority 2) */}
        {currentView === 'jobs' && (
          <JobLifecycleView
            jobs={jobs}
            onUpdateJob={handleUpdateJob}
            onGenerateInvoice={handleGenerateInvoiceFromJob}
            onOpenEstimatorForJob={(qId) => {
              setActiveQuoteId(qId);
              setCurrentView('estimator');
            }}
          />
        )}

        {/* Module 4: Invoicing & Accounting (Priority 3) */}
        {currentView === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            onUpdateInvoice={handleUpdateInvoice}
            onCreateInvoice={handleCreateInvoice}
            companyName={settings.companyName}
            companyPhone={settings.phone}
            companyEmail={settings.email}
          />
        )}

        {/* Module 5: Customer Proposal Portal */}
        {currentView === 'customer_preview' && activeQuote && (
          <CustomerProposalView
            quote={activeQuote}
            onUpdateQuote={handleUpdateQuote}
            onBackToApp={() => setCurrentView('estimator')}
            stripePaymentLink={settings.stripePaymentLink}
          />
        )}

        {/* Module 6: Crew Dispatch & Scheduling (Priority 4) */}
        {currentView === 'dispatch' && (
          <DispatcherBoard
            quotes={quotes}
            technicians={technicians}
            crewSchedules={crewSchedules}
            onUpdateScheduleStatus={handleUpdateScheduleStatus}
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

      {/* 100% Synchronized Official Printable Proposal PDF */}
      {activeQuote && (
        <PrintableProposalDocument
          quote={activeQuote}
          companyName={settings.companyName}
          companyPhone={settings.phone}
          companyEmail={settings.email}
        />
      )}

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
