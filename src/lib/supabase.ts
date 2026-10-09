import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Quote } from '../types';

// Retrieve credentials from localStorage first (user-configured in UI), then env vars
export function getSupabaseCredentials(): { url: string; key: string } {
  const customUrl = localStorage.getItem('apex_supabase_url');
  const customKey = localStorage.getItem('apex_supabase_anon_key');
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = customUrl || envUrl;
  const key = customKey || envKey;

  return { url: url.trim(), key: key.trim() };
}

export function isCloudConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-url') &&
    url.startsWith('https://')
  );
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (activeClient) return activeClient;
  const { url, key } = getSupabaseCredentials();
  if (url && key && url.startsWith('https://') && !url.includes('your-project-url')) {
    try {
      activeClient = createClient(url, key, {
        auth: { persistSession: true },
      });
      return activeClient;
    } catch (e) {
      console.warn('[Supabase Init Error]:', e);
      return null;
    }
  }
  return null;
}

export function resetSupabaseClient(): void {
  activeClient = null;
}

/**
 * Tests connection to Supabase and verifies if the 'quotes' table is ready.
 */
export async function testSupabaseConnection(testUrl?: string, testKey?: string): Promise<{
  success: boolean;
  message: string;
  tableReady: boolean;
}> {
  const url = (testUrl || getSupabaseCredentials().url).trim();
  const key = (testKey || getSupabaseCredentials().key).trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key cannot be empty.',
      tableReady: false,
    };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      success: false,
      message: 'URL must look like https://your-project-ref.supabase.co',
      tableReady: false,
    };
  }

  try {
    const tempClient = createClient(url, key);
    const { error } = await tempClient
      .from('quotes')
      .select('id')
      .limit(1);

    if (error) {
      // Table doesn't exist yet
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! However, the "quotes" table is not created yet. Please execute the SQL schema in your Supabase SQL Editor.',
          tableReady: false,
        };
      }
      return {
        success: false,
        message: `Supabase Error (${error.code || 'API'}): ${error.message}`,
        tableReady: false,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase PostgreSQL cloud database! Tables and realtime sync are active.',
      tableReady: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || 'Check network or credentials'}`,
      tableReady: false,
    };
  }
}

/**
 * Fetches all quotes from the Supabase PostgreSQL database.
 */
export async function fetchQuotesFromCloud(): Promise<{ quotes: Quote[] | null; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { quotes: null, error: 'Cloud database not configured.' };
  }

  try {
    const { data, error } = await client
      .from('quotes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Supabase fetchQuotes error]:', error.message);
      return { quotes: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { quotes: [] };
    }

    const quotes: Quote[] = data.map((row: any) => {
      if (row.payload && typeof row.payload === 'object') {
        return row.payload as Quote;
      }
      // Fallback rebuild from columns
      return {
        id: row.id,
        jobId: row.job_id || `JOB-${row.id}`,
        customer: {
          id: `cust_${row.id}`,
          name: row.customer_name || 'Homeowner',
          phone: row.customer_phone || '',
          email: row.customer_email || '',
          address: row.customer_address || '',
          city: row.customer_city || 'Austin',
          state: row.customer_state || 'TX',
          zip: row.customer_zip || '78701',
        },
        technician: {
          id: 'tech_1',
          name: row.technician_name || 'Marcus Vance',
          phone: '(512) 842-1190',
          role: 'Lead Estimator',
          status: 'available',
          currentLocation: { lat: 30.2672, lng: -97.7431, address: 'Austin, TX' },
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
        calculation: {
          groundSqFt: Number(row.ground_sqft) || 2400,
          pitch: (row.roof_pitch as any) || '6/12',
          wastePercent: Number(row.waste_percent) || 12,
          stories: Number(row.stories) || 1,
          rawSquares: Number(row.total_squares) || 28,
          totalSquares: Number(row.total_squares) || 31.36,
          bundleCount: Number(row.bundle_count) || 95,
        },
        selectedTier: (row.selected_tier as any) || 'better',
        addons: row.addons || [],
        photos: row.photos || [],
        subtotal: Number(row.subtotal) || 14000,
        tax: Number(row.tax_amount) || 1155,
        total: Number(row.total_amount) || 15155,
        depositPercent: Number(row.deposit_percent) || 10,
        depositAmount: Number(row.deposit_amount) || 1515.5,
        status: (row.status as any) || 'quoted',
        signatureDataUrl: row.signature_data_url || undefined,
        signedByName: row.signed_by_name || undefined,
        signedAt: row.signed_at || undefined,
        stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
        depositPaidAt: row.deposit_paid_at || undefined,
        createdAt: row.created_at || new Date().toISOString(),
      };
    });

    return { quotes };
  } catch (err: any) {
    return { quotes: null, error: err?.message || 'Network error' };
  }
}

/**
 * Saves or updates a quote in the Supabase PostgreSQL cloud database.
 */
export async function syncQuoteToCloud(quote: Quote): Promise<{ success: boolean; cloud: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true, cloud: false };
  }

  try {
    const { error } = await client.from('quotes').upsert(
      {
        id: quote.id,
        job_id: quote.jobId,
        customer_name: quote.customer.name,
        customer_phone: quote.customer.phone,
        customer_email: quote.customer.email,
        customer_address: quote.customer.address,
        customer_city: quote.customer.city,
        customer_state: quote.customer.state,
        customer_zip: quote.customer.zip,
        technician_name: quote.technician.name,
        ground_sqft: quote.calculation.groundSqFt,
        roof_pitch: quote.calculation.pitch,
        waste_percent: quote.calculation.wastePercent,
        stories: quote.calculation.stories,
        total_squares: quote.calculation.totalSquares,
        bundle_count: quote.calculation.bundleCount,
        selected_tier: quote.selectedTier,
        subtotal: quote.subtotal,
        tax_amount: quote.tax,
        total_amount: quote.total,
        deposit_percent: quote.depositPercent,
        deposit_amount: quote.depositAmount,
        status: quote.status,
        signature_data_url: quote.signatureDataUrl,
        signed_by_name: quote.signedByName,
        signed_at: quote.signedAt,
        stripe_payment_intent_id: quote.stripePaymentIntentId,
        deposit_paid_at: quote.depositPaidAt,
        addons: quote.addons,
        photos: quote.photos,
        payload: quote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('[Supabase Cloud Sync Error]:', error.message);
      return { success: false, cloud: true, error: error.message };
    }

    return { success: true, cloud: true };
  } catch (err: any) {
    console.error('[Supabase Unexpected Error]:', err);
    return { success: false, cloud: true, error: err?.message || 'Network error' };
  }
}

/**
 * Real-time subscription to listen for updates or inserts across devices.
 */
export function subscribeToQuotes(onQuoteUpdate: (quote: Quote) => void): (() => void) | null {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('apex_quotes_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        (payload: any) => {
          if (payload.new && payload.new.payload) {
            onQuoteUpdate(payload.new.payload as Quote);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Realtime subscribe error]:', err);
    return null;
  }
}
