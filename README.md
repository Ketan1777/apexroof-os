# 🛠️ ApexRoof OS | Vertical Field Operations & Invoicing App

A lightweight, mobile-first operating system designed specifically for **Residential Roofing, Restoration, and High-Ticket Trade Contractors**.

Built to replace bloated, expensive platforms like ServiceTitan (\$400+/mo) with an on-site, 60-second quote generator, touch signature e-signing, instant Stripe deposit capture, and automated client SMS alerts.

---

## 🚀 Key Features

### 1. 📱 Field Estimator & Measurement Engine
- **Pitch Multiplier Calculator**: Auto-calculates geometry slope factors for 2/12 up to 12/12 pitches.
- **Roof Squares & Bundle Counter**: Converts ground square footage and waste factors (10% - 25%) directly into billable roof squares and shingle pallet bundle counts.
- **Good / Better / Best 3-Tier Packages**:
  - *Good*: Standard 3-Tab Shield (GAF Royal Sovereign, 25-yr)
  - *Better (68% close rate)*: StormMaster Pro (Owens Corning Duration, 50-yr algae resist)
  - *Best*: Platinum Armor (CertainTeed Presidential / Metal Standing Seam, Class 4 Hail discount)
- **Protection Add-ons**: Up-sell ice & water shield, continuous ridge vent, seamless 6" aluminum gutters, and chimney flashing with 1 tap.
- **Damage Photo Logger**: Attach on-site photos of hail strikes, wind-lifted shingles, and cracked pipe boots with severity tags.

### 2. ✍️ Digital Touch E-Signature
- Interactive HTML5 canvas signature pad optimized for iPad, iPhone, and Android devices in the truck or driveway.
- Legal binding homeowner authorization clause and timestamped contract execution.

### 3. 💳 Instant Stripe Connect Deposit Checkout
- Homeowner deposits (30% to 50%) collected on the driveway via **Apple Pay**, **Credit/Debit Card**, or **ACH Bank Transfer**.
- Instant receipt confirmation and webhook state triggers.

### 4. 🛰️ GPS Crew Telemetry & Dispatch Board
- Live technician tracking with route navigation status (`available`, `en_route`, `on_site`).
- Pipeline financial metrics: Gross pipeline value, collected deposits, and conversion rates.
- 1-click automated SMS triggers: Send "Tech is en route (ETA 12m)" or "Interactive Proposal Link" to the homeowner's phone.

### 5. 🏡 Interactive Customer Presentation Portal
- Clean, branded proposal view designed for homeowner review on an iPad or shared via SMS link.
- Homeowners can toggle between Good/Better/Best tiers to fit their budget before signing.

---

## 📂 Project Structure

```text
roofing-field-ops/
├── src/
│   ├── components/
│   │   ├── Estimator/          # Measurement calculator, 3-tier selector, add-ons, photos
│   │   ├── Signature/          # HTML5 Canvas touch signature pad
│   │   ├── Payment/            # Stripe checkout modal (Apple Pay, Card, ACH)
│   │   ├── Dispatch/           # Crew GPS tracking, pipeline metrics, dispatch board
│   │   ├── ClientPortal/       # Customer-facing proposal view
│   │   ├── SMS/                # Simulated Twilio client SMS outbox
│   │   └── Navbar.tsx          # Mode switcher (Field Estimator, Client View, Dispatch)
│   ├── data/
│   │   └── seedData.ts         # Sample contractor data, roof tiers, technicians, and quotes
│   ├── types/
│   │   └── index.ts            # Complete TypeScript domain models
│   ├── App.tsx                 # Main application state and view router
│   ├── main.tsx
│   └── index.css               # Tailwind CSS theme
├── supabase/
│   └── schema.sql              # Multi-tenant PostgreSQL schema with RLS and Stripe triggers
├── scripts/
│   └── contractor_lead_scraper.py # Free Google Maps / OpenStreetMap contractor lead generator
├── templates/
│   └── cold_outreach_playbook.md  # Step-by-step ₹0 to ₹1 Cr/mo cold SMS & sales scripts
└── package.json
```

---

## ⚡ Quick Start

### 1. Install & Run Frontend
```bash
# Navigate to the project
cd roofing-field-ops

# Install dependencies (already installed)
npm install

# Start local development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Run the Free Contractor Lead Scraper
Generate 50 qualified roofing contractors in Austin, TX with personalized cold SMS hooks:
```bash
python scripts/contractor_lead_scraper.py --city "Austin" --state "TX" --trade "roofing"
```
Outputs a CSV file `contractor_leads_austin.csv` ready for cold outreach.

### 3. Deploy Backend to Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> Paste the contents of `supabase/schema.sql` -> Click **Run**.
3. Row-Level Security (RLS) is automatically enabled for multi-tenant isolation.

---

.
