export type RoofPitch = '2/12' | '4/12' | '6/12' | '8/12' | '10/12' | '12/12';

export interface PitchConfig {
  pitch: RoofPitch;
  label: string;
  multiplier: number;
  description: string;
}

export type ShingleTierId = 'good' | 'better' | 'best';

export interface ShingleTier {
  id: ShingleTierId;
  name: string;
  brand: string;
  warranty: string;
  pricePerSquare: number;
  highlight?: boolean;
  features: string[];
  windRating: string;
  algaeResistance: string;
}

export interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'flat' | 'per_square' | 'each';
  selected: boolean;
  quantity?: number;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  timestamp: string;
}

export type JobStatus = 'lead' | 'inspecting' | 'quoted' | 'deposit_paid' | 'in_progress' | 'completed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  role: 'Lead Estimator' | 'Crew Foreman' | 'Master Roofer';
  status: 'available' | 'en_route' | 'on_site' | 'off_duty';
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  etaMinutes?: number;
  avatar: string;
}

export interface RoofCalculation {
  groundSqFt: number;
  pitch: RoofPitch;
  wastePercent: number;
  stories: number;
  rawSquares: number;
  totalSquares: number; // 1 square = 100 sq ft
  bundleCount: number; // 3 bundles per square
}

export interface Quote {
  id: string;
  jobId: string;
  customer: Customer;
  technician: Technician;
  calculation: RoofCalculation;
  selectedTier: ShingleTierId;
  addons: AddonItem[];
  photos: InspectionPhoto[];
  subtotal: number;
  tax: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  status: JobStatus;
  signatureDataUrl?: string;
  signedAt?: string;
  signedByName?: string;
  stripePaymentIntentId?: string;
  depositPaidAt?: string;
  createdAt: string;
}

export interface SmsMessage {
  id: string;
  to: string;
  recipientName: string;
  body: string;
  timestamp: string;
  type: 'en_route' | 'quote_sent' | 'deposit_received' | 'crew_dispatched';
}

// -------------------------------------------------------------
// CRM & Sales Pipeline Types (Priority 1)
// -------------------------------------------------------------
export type LeadStage =
  | 'new'
  | 'contacted'
  | 'inspection_scheduled'
  | 'quote_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadSource =
  | 'Website'
  | 'Door-to-Door'
  | 'Referral'
  | 'Google Search'
  | 'Insurance Claim'
  | 'Storm Canvass';

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  leadSource: LeadSource;
  dateReceived: string;
  assignedSalesperson: string;
  estimatedValue: number;
  nextFollowUpDate: string;
  stage: LeadStage;
  notes: string;
  quoteId?: string;
}

// -------------------------------------------------------------
// Job Lifecycle & Operations Types (Priority 2)
// -------------------------------------------------------------
export type JobLifecycleStage =
  | 'quote_approved'
  | 'deposit_received'
  | 'materials_ordered'
  | 'scheduled'
  | 'in_progress'
  | 'quality_inspection'
  | 'completed'
  | 'invoiced'
  | 'paid';

export interface RoofingJob {
  id: string;
  jobId: string;
  quoteId: string;
  customer: Customer;
  stage: JobLifecycleStage;
  assignedCrewId?: string;
  assignedCrewName?: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  shingleTier: string;
  totalSquares: number;
  contractAmount: number;
  depositPaid: number;
  remainingBalance: number;
  materialCost: number;
  laborCost: number;
  dumpsterPermitCost: number;
  grossProfit: number;
  marginPercent: number;
  notes?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// Real Invoicing & Accounting Types (Priority 3)
// -------------------------------------------------------------
export type InvoiceStatus = 'draft' | 'sent' | 'deposit_applied' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId: string;
  quoteId: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  depositPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  paidAt?: string;
  paymentMethod?: string;
}

// -------------------------------------------------------------
// Team & Crew Scheduling Types (Priority 4)
// -------------------------------------------------------------
export interface CrewScheduleItem {
  id: string;
  technicianId: string;
  technicianName: string;
  jobId: string;
  customerName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  taskType: 'Roof Replacement' | 'Storm Inspection' | 'Tear-off & Prep' | 'Quality Check & Magnet Sweep';
  status: 'scheduled' | 'in_progress' | 'completed';
}
