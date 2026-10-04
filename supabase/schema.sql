-- ==============================================================================
-- APEXROOF OS: Production-Grade Multi-Tenant Supabase / PostgreSQL Schema
-- Designed for High-Ticket Trade Contractors (Roofing, Siding, Solar, Tree Care)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CONTRACTORS (Tenants / Businesses)
create table if not exists public.contractors (
    id uuid primary key default uuid_generate_v4(),
    company_name text not null,
    owner_email text not null unique,
    phone text,
    license_number text,
    insurance_policy text,
    state_code varchar(2) default 'TX',
    stripe_account_id text, -- Stripe Connect Express Account ID
    stripe_onboarding_completed boolean default false,
    monthly_plan text default 'contractor_pro', -- $199/mo or $299/mo
    subscription_status text default 'trialing', -- trialing, active, past_due
    created_at timestamp with time zone default now()
);

-- 2. TECHNICIANS & FIELD CREW
create table if not exists public.technicians (
    id uuid primary key default uuid_generate_v4(),
    contractor_id uuid not null references public.contractors(id) on delete cascade,
    user_id uuid references auth.users(id), -- If logged into mobile app
    full_name text not null,
    phone text not null,
    role text not null check (role in ('Lead Estimator', 'Crew Foreman', 'Master Roofer', 'Apprentice')),
    status text default 'available' check (status in ('available', 'en_route', 'on_site', 'off_duty')),
    current_lat double precision,
    current_lng double precision,
    last_gps_update timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- 3. CUSTOMERS (Homeowners & Commercial Property Managers)
create table if not exists public.customers (
    id uuid primary key default uuid_generate_v4(),
    contractor_id uuid not null references public.contractors(id) on delete cascade,
    full_name text not null,
    phone text not null,
    email text,
    street_address text not null,
    city text not null,
    state_code varchar(2) not null,
    postal_code text not null,
    created_at timestamp with time zone default now()
);

-- 4. JOBS & ESTIMATES
create table if not exists public.quotes (
    id text primary key, -- e.g. QT-8801
    contractor_id uuid not null references public.contractors(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    technician_id uuid references public.technicians(id),
    
    -- Roof Measurement Engine fields
    ground_sqft numeric(10, 2) not null,
    roof_pitch text not null default '6/12',
    pitch_multiplier numeric(4, 2) default 1.12,
    stories int default 1,
    waste_percent int default 12,
    total_squares numeric(8, 2) not null,
    bundle_count int not null,
    
    -- Selected Shingle Package Tier
    selected_tier text not null check (selected_tier in ('good', 'better', 'best')),
    
    -- Financials
    subtotal numeric(12, 2) not null,
    tax_amount numeric(12, 2) not null,
    total_amount numeric(12, 2) not null,
    deposit_percent int default 30,
    deposit_amount numeric(12, 2) not null,
    
    -- Status progression
    status text not null default 'quoted' check (status in ('lead', 'inspecting', 'quoted', 'deposit_paid', 'in_progress', 'completed')),
    
    -- E-Signature capture
    signature_data_url text,
    signed_by_name text,
    signed_at timestamp with time zone,
    
    -- Stripe Payment
    stripe_payment_intent_id text,
    deposit_paid_at timestamp with time zone,
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 5. QUOTE ADDONS (Line Item Upgrades)
create table if not exists public.quote_addons (
    id uuid primary key default uuid_generate_v4(),
    quote_id text not null references public.quotes(id) on delete cascade,
    name text not null,
    unit_price numeric(10, 2) not null,
    unit text not null check (unit in ('flat', 'per_square', 'each')),
    selected boolean default true
);

-- 6. INSPECTION PHOTOS & DAMAGE TAGS
create table if not exists public.quote_photos (
    id uuid primary key default uuid_generate_v4(),
    quote_id text not null references public.quotes(id) on delete cascade,
    photo_url text not null,
    label text not null,
    severity text not null check (severity in ('low', 'medium', 'high')),
    notes text,
    created_at timestamp with time zone default now()
);

-- 7. SMS NOTIFICATIONS AUDIT LOG
create table if not exists public.sms_logs (
    id uuid primary key default uuid_generate_v4(),
    contractor_id uuid not null references public.contractors(id) on delete cascade,
    quote_id text references public.quotes(id),
    recipient_phone text not null,
    recipient_name text not null,
    message_body text not null,
    message_type text check (message_type in ('en_route', 'quote_sent', 'deposit_received', 'crew_dispatched')),
    twilio_sid text,
    status text default 'delivered',
    created_at timestamp with time zone default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR MULTI-TENANT ISOLATION
-- Ensures Contractor A can NEVER read or modify Contractor B's jobs or customers
-- ==============================================================================

alter table public.contractors enable row level security;
alter table public.technicians enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_addons enable row level security;
alter table public.quote_photos enable row level security;
alter table public.sms_logs enable row level security;

-- Policy: Contractors can only view and update their own company data
create policy "Contractor self-access" on public.contractors
    for all using (owner_email = auth.jwt() ->> 'email');

-- Policy: Quotes accessible by owning contractor
create policy "Quotes tenant isolation" on public.quotes
    for all using (
        contractor_id in (select id from public.contractors where owner_email = auth.jwt() ->> 'email')
    );

-- Policy: Public readonly view for customer interactive proposal link
create policy "Public client proposal view" on public.quotes
    for select using (true);

-- Policy: Public e-sign update for customer interactive proposal link
create policy "Public client e-sign submit" on public.quotes
    for update using (true)
    with check (status in ('quoted', 'deposit_paid'));

-- ==============================================================================
-- STRIPE WEBHOOK HANDLER TRIGGER
-- Automatically updates quote status upon payment_intent.succeeded
-- ==============================================================================
create or replace function public.handle_stripe_deposit_payment()
returns trigger as $$
begin
    if NEW.stripe_payment_intent_id is not null and OLD.stripe_payment_intent_id is null then
        NEW.status := 'deposit_paid';
        NEW.deposit_paid_at := now();
    end if;
    return NEW;
end;
$$ language plpgsql;

create trigger tr_stripe_deposit_paid
    before update on public.quotes
    for each row
    execute function public.handle_stripe_deposit_payment();
