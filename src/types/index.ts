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
