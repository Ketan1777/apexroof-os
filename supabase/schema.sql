-- ==============================================================================
-- APEXROOF OS: Production-Grade PostgreSQL Schema for Supabase
-- Single-Click Execution - Zero foreign-key dependency errors
-- ==============================================================================

-- 1. Create Quotes Table
create table if not exists public.quotes (
    id text primary key, -- e.g. QT-8801
    job_id text,
    customer_name text,
    customer_phone text,
    customer_email text,
    customer_address text,
    customer_city text,
    customer_state text default 'TX',
    customer_zip text,
    technician_name text,
    
    -- Roof Specs
    ground_sqft numeric(10, 2),
    roof_pitch text default '6/12',
    waste_percent int default 12,
    stories int default 1,
    total_squares numeric(10, 2),
    bundle_count int,
    selected_tier text default 'better',
    
    -- Financials
    subtotal numeric(12, 2),
    tax_amount numeric(12, 2),
    total_amount numeric(12, 2),
    deposit_percent int default 10,
    deposit_amount numeric(12, 2),
    status text default 'quoted',
    
    -- Signatures & Stripe
    signature_data_url text,
    signed_by_name text,
    signed_at timestamptz,
    stripe_payment_intent_id text,
    deposit_paid_at timestamptz,
    
    -- JSON Collections for 100% loss-free roundtrip
    addons jsonb default '[]'::jsonb,
    photos jsonb default '[]'::jsonb,
    payload jsonb not null,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Indexes for High-Performance Queries
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_quotes_customer on public.quotes(customer_name);
create index if not exists idx_quotes_updated on public.quotes(updated_at desc);

-- 3. Enable Row Level Security (RLS) & Allow Access for Mobile & Client Portals
alter table public.quotes enable row level security;

-- Drop previous policies if they exist to prevent duplicate error
drop policy if exists "Allow public select" on public.quotes;
drop policy if exists "Allow public insert" on public.quotes;
drop policy if exists "Allow public update" on public.quotes;
drop policy if exists "Allow public delete" on public.quotes;

create policy "Allow public select" on public.quotes for select using (true);
create policy "Allow public insert" on public.quotes for insert with check (true);
create policy "Allow public update" on public.quotes for update using (true);
create policy "Allow public delete" on public.quotes for delete using (true);

-- 4. Enable Supabase Realtime for instant phone-to-laptop WebSocket sync
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'quotes'
  ) then
    alter publication supabase_realtime add table public.quotes;
  end if;
end $$;
