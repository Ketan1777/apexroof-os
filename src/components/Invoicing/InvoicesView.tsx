import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  CreditCard,
  X,
  FileText,
  AlertCircle,
  Download,
  Building
} from 'lucide-react';
import { Invoice, InvoiceStatus, RoofingJob } from '../../types';

interface InvoicesViewProps {
  invoices: Invoice[];
  onUpdateInvoice: (updated: Invoice) => void;
  onCreateInvoice: (newInv: Invoice) => void;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
}

const STATUS_CONFIGS: Record<InvoiceStatus, { label: string; color: string; border: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800' },
  sent: { label: 'Sent to Client', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  deposit_applied: { label: 'Deposit Credited', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  paid: { label: 'Paid in Full', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/15' },
  overdue: { label: 'Past Due', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
};

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  onUpdateInvoice,
  onCreateInvoice,
  companyName,
  companyPhone,
  companyEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [recordPaymentInvoice, setRecordPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Check' | 'Stripe' | 'Wire' | 'Cash'>('Check');
  const [paymentReference, setPaymentReference] = useState('CHK #4019');

  // Aggregates
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoices.reduce(
    (sum, inv) => sum + (inv.status === 'paid' ? inv.total : inv.depositPaid),
    0
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + (inv.status === 'paid' ? 0 : inv.amountDue),
    0
  );
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.jobId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = (inv: Invoice) => {
    const updated: Invoice = {
      ...inv,
      status: 'paid',
      amountDue: 0,
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: `${paymentMethod} (${paymentReference})`,
    };
    onUpdateInvoice(updated);
    setRecordPaymentInvoice(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-inner">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                Invoicing & Accounting
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Job Billing Center
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate itemized contractor tax invoices, track deposit credits, and record full balances
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            ${totalInvoiced.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Collected Cash
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            ${totalCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Deposits & paid balances</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Outstanding Receivables
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            ${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Due upon completion</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Collection Efficiency
          </span>
          <span className="text-2xl font-black text-teal-300 font-mono mt-1 block">
            {collectionRate}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Healthy cash flow</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, customer name, or Job ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses ({invoices.length})</option>
            <option value="sent">Sent</option>
            <option value="deposit_applied">Deposit Credited</option>
            <option value="paid">Paid in Full</option>
            <option value="overdue">Past Due</option>
          </select>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Homeowner</th>
                <th className="py-3.5 px-4">Job Reference</th>
                <th className="py-3.5 px-4">Issue / Due Date</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Deposit Credited</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredInvoices.map((inv) => {
                const statusCfg = STATUS_CONFIGS[inv.status] || STATUS_CONFIGS.sent;

                return (
                  <tr key={inv.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{inv.customer.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {inv.customer.address}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-400 text-xs">
                      {inv.jobId}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-slate-500">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      -${inv.depositPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-400">
                      ${inv.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.border} ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View & Print Official Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => setRecordPaymentInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                            title="Record final payment"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Record Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordPaymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setRecordPaymentInvoice(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Record Final Invoice Payment</h3>
            </div>
            <p className="text-xs text-slate-400">
              For Invoice <strong className="text-white font-mono">{recordPaymentInvoice.invoiceNumber}</strong> &bull; {recordPaymentInvoice.customer.name}
            </p>

            <div className="my-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Outstanding Balance:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  ${recordPaymentInvoice.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Check">Homeowner Check</option>
                  <option value="Stripe">Stripe Credit Card / Debit</option>
                  <option value="Wire">Bank Wire / ACH</option>
                  <option value="Cash">Cash on Completion</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Reference / Check Number / Note
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordPaymentInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkPaid(recordPaymentInvoice)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 text-xs font-black shadow-md"
                >
                  Confirm Payment Received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Invoice Modal (Priority 3 core feature) */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-8 font-sans">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute right-5 top-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
                  {companyName}
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Austin, TX &bull; Roofing License #TX-ROOF-9941
                </p>
                <p className="text-xs text-slate-600">
                  {companyPhone} &bull; {companyEmail}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase block">TAX INVOICE</span>
                <span className="text-xl font-black font-mono text-slate-950">
                  {selectedInvoiceForPrint.invoiceNumber}
                </span>
                <span className="text-xs text-slate-600 block mt-1">
                  Date: {selectedInvoiceForPrint.issueDate}
                </span>
                <span className="text-xs text-rose-600 font-bold block">
                  Due: {selectedInvoiceForPrint.dueDate}
                </span>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Billed To Homeowner:
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedInvoiceForPrint.customer.name}
                </div>
                <div className="text-slate-600">{selectedInvoiceForPrint.customer.address}</div>
                <div className="text-slate-600">
                  {selectedInvoiceForPrint.customer.city}, {selectedInvoiceForPrint.customer.state} {selectedInvoiceForPrint.customer.zip}
                </div>
                <div className="text-slate-600">{selectedInvoiceForPrint.customer.phone}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Job Reference:
                </span>
                <div className="font-mono font-bold text-slate-900">
                  Job ID: {selectedInvoiceForPrint.jobId}
                </div>
                <div className="text-slate-600">Quote ID: {selectedInvoiceForPrint.quoteId}</div>
                <div className="text-slate-600 mt-2 font-semibold">
                  Status:{' '}
                  <span className="uppercase text-emerald-700 font-bold">
                    {selectedInvoiceForPrint.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-xs mb-6 border-collapse">
              <thead>
                <tr className="border-b border-slate-300 font-bold text-slate-700 uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty / SQ</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoiceForPrint.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono font-bold">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations and Balance Due */}
            <div className="border-t-2 border-slate-900 pt-4 space-y-1.5 text-xs font-mono ml-auto max-w-xs">
              <div className="flex justify-between text-slate-700">
                <span className="font-sans">Subtotal:</span>
                <span>${selectedInvoiceForPrint.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-sans">Texas Sales Tax (8.25%):</span>
                <span>${selectedInvoiceForPrint.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span className="font-sans">Total Contract:</span>
                <span>${selectedInvoiceForPrint.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span className="font-sans">Less Deposit Paid:</span>
                <span>-${selectedInvoiceForPrint.depositPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                <span className="font-sans">Final Balance Due:</span>
                <span>${selectedInvoiceForPrint.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer with Payment Instructions */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p>Remit payment via check or online via credit card / ACH.</p>
                <p className="font-semibold text-slate-700">Thank you for your business!</p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
