import { createClient } from '@supabase/supabase-js';
import { Quote } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isCloudConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-url')
);

export const supabase = isCloudConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Syncs a quote to Supabase PostgreSQL cloud table if configured,
 * otherwise falls back to local storage.
 */
export async function syncQuoteToCloud(quote: Quote): Promise<{ success: boolean; cloud: boolean; error?: string }> {
  if (!isCloudConfigured || !supabase) {
    return { success: true, cloud: false };
  }

  try {
    const { error } = await supabase.from('quotes').upsert(
      {
        id: quote.id,
        ground_sqft: quote.calculation.groundSqFt,
        roof_pitch: quote.calculation.pitch,
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
