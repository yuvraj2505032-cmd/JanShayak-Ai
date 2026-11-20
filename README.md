# Janshayak AI — Government Scheme Eligibility Navigator

**Janshayak AI (ਜਨਸਹਾਇਕ ਏਆਈ / जनसहायक एआई)** is a **Hybrid Online + Offline Progressive Web Application (PWA)** designed to help citizens across **Punjab and all 36 Indian States & Union Territories (28 States + 8 UTs)** discover verified government welfare schemes, check instant eligibility, calculate household benefits, verify official `.gov.in` / `.nic.in` portals, and track applications in **English, Punjabi (ਪੰਜਾਬੀ), and Hindi (हिन्दी)**.

---

## Key Features

### 1. Hybrid Online + Offline Mode (Installable PWA)
- **100% Online & 100% Offline Ready**: Powered by a custom Service Worker (`/frontend/public/sw.js`) and deterministic client-side engines (`schemeEngine.ts`, `offlineCache.ts`, `cyberFraudScanner.ts`).
- **Installable App (`Offline App`)**: Works as a standalone desktop and mobile application with automatic offline caching of schemes, citizen profiles, saved bookmarks, and application trackers.
- **Live Connectivity Indicator**: Displays real-time network status (`Online + Offline Ready` vs. `Offline Mode`) with zero data loss during connectivity transitions.

### 2. Pan-India Coverage: All 36 States/UTs & 780+ Districts
- **Complete State & District Registry**: Covers all **28 Indian States and 8 Union Territories** with **780+ Districts**.
- **District e-Seva & Collectorate Directory**: Provides verified Collectorate / Sewa Kendra / CSC addresses, Deputy Commissioner (DC) office contacts, official portals, and toll-free helplines for every district.
- **Custom Location & Geolocation Resolver**: Supports custom village, city, 6-digit PIN code, and live browser GPS resolution to match state- and district-specific welfare schemes.

### 3. Dynamic Occupation & Live Eligibility Engine
- **Instant Occupation Presets**: Selecting an occupation (`Student`, `Farmer`, `Homemaker`, `Senior Citizen`, `Self-Employed`, `Daily Wage Worker`, `Unemployed Youth`) dynamically configures tailored eligibility parameters and re-evaluates all schemes in real time.
- **Granular Match Scoring**: Categorizes every scheme into **Confirmed Eligible (`100% Match`)**, **Potential Match**, or **Not Eligible**, with transparent satisfied and failed condition breakdowns.
- **Interactive Simulation Tools**:
  - **Profile & Eligibility Wizard**: Guided multi-step citizen profile builder.
  - **What-If Eligibility Simulator**: Test how changes in age, income, landholding, or category unlock additional schemes.
  - **Family Benefit Finder**: Calculate combined annual welfare entitlements across multiple household members.
  - **Per-Scheme Benefit Estimator**: Compute annualized and 5-year direct bank transfer (DBT) / subsidy value.

### 4. Cyber Fraud Shield & Anti-Hacker Website Scanner
- **Deep Website Authenticity Analysis**: Inspects URLs, SMS/WhatsApp links, and domains for HTTPS security, official `.gov.in` / `.nic.in` registry verification, brand spoofing, and phishing lures.
- **Anti-Hacker WAF Inspection**: Detects and blocks SQL Injection (`SQLi`), Cross-Site Scripting (`XSS`), Path Traversal, Command Injection, and malicious `.apk` / `.exe` sideloading links.
- **Risk & Trust Scoring**: Produces a `0–100` Risk Score (`Low`, `Medium`, `High` Risk) and a `0–100` Trust Score, automatically recommending the verified official `.gov.in` replacement portal.

### 5. Autonomous AI Admin & Knowledge Base Management (AI & Admin Exclusive)
- **Continuous Scheme Discovery**: Automatically discovers and adds new (`2025–2026`) and classic (`Purani`) State & Central welfare schemes in both Online and Offline modes (capped & deduplicated for clean directory performance).
- **AI & Admin Restricted Controls**: Manual scheme synchronization, custom topic generation, and SMS broadcast controls are strictly restricted to authenticated AI/Admin sessions (`AdminConsole`), keeping the citizen dashboard clean and automatic.
- **Admin Console**: Password-protected CRUD interface to add, edit, delete, and restore schemes and official portals in the live knowledge base.

### 6. Profile Mobile Number & Autonomous AI Auto-SMS Alerts
- **Profile Mobile Number (`+91`)**: Citizens save their 10-digit Indian mobile number directly inside **My Profile** (`ProfileWizard.tsx`).
- **Automatic AI SMS on New Schemes & Completed Website Work**:
  - Whenever a **New Scheme** arrives on the website (`"🆕 ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਨਵੀਂ ਸਕੀਮ ਆਈ ਆ!"`) or **the user completes work on the website** (`"✅ ਤੁਹਾਡਾ ਕੰਮ ਹੋ ਗਿਆ! / Tuhada Kam Ho Gaya!"` — saving their profile, bookmarking a scheme, or updating their Application Tracker), AI automatically dispatches an SMS to their profile mobile number with full in-website scheme details and displays a live AI Auto-SMS toast notification.

### 7. Saved Scheme Deadline & Status-Change Notification System
- **Navbar Notification Bell & Popover (`NotificationCenter.tsx`)**: Sticky top-bar bell button with a live unread badge and segmented tabs (**All**, **Deadlines**, **Status**).
- **30-Day Approaching Deadline Alerts**: Automatically monitors all saved schemes and generates `critical` ($\le 7$ days / Closes Today), `urgent` ($\le 15$ days), and `upcoming` ($\le 30$ days) alerts with cutoff dates and direct portal/application links.
- **Real-Time Status Change Alerts**: Alerts users with a floating toast (`SchemeNotificationToast`) and notification history entry whenever a saved or tracked scheme advances across stages (`Discovered` → `Documents Ready` → `Applied (Form Submitted)` → `Approved` → `DBT Disbursed`).

### 8. Advanced Scheme Discovery: Sector Filters, Sorting, Saved Toggle & Side-by-Side Comparison
- **Sector Category Filter Bar**: One-click dashboard segmentation across **All Sectors**, **Agriculture**, **Education**, **Women**, **Seniors**, **Health**, **Finance**, and **Business & Jobs** with live scheme counts.
- **Scheme Directory Sorting Toggle**: Sort schemes dynamically by **Newest** (`2025–2026` & AI-added recency), **Popularity** (match score, bookmark status & flagship priority), and **Benefit Amount** (parsed rupee value & annualized installment extraction).
- **Saved Schemes Filter Toggle**: Dedicated dashboard toggle to switch instantly between viewing **All Schemes** and **Saved Schemes Only**.
- **Side-by-Side Scheme Comparison (`Compare` Modal & Tray)**: Select up to **3 schemes** using the `Compare` button on any `SchemeCard` to open a side-by-side comparison matrix displaying **Key Benefits**, **Personalized Eligibility Verdict & Match %**, **Age & Annual Income Ceilings**, **Eligible Occupations & Categories**, **Required Documents**, and **Official `.gov.in` Portal Links**.

### 9. "Photo Bhejo, Jawab Pao" & Rural Accessibility (2G/3G Lite Mode + PDF Guides)
- **Photo Bhejo, Jawab Pao (`PhotoJawabModal.tsx`)**: Snap or upload a photo of a **Ration Card**, **Electricity Bill (PSPCL 300 Units Free)**, **Aadhaar / Certificate**, or **Government Application Form** — Janshayak AI reads it and explains in simple Punjabi, Hindi, or English (with voice readout):
  1. *"ਇਹਦੇ ਚ ਕੀ ਲਿਖਿਆ ਆ (Ehde ch ki likheya aa)"* — What is written in the document.
  2. *"ਅੱਗੇ ਕੀ ਕਰਨਾ ਆ (Agge ki karna aa)"* — Step-by-step action items and matching government schemes.
- **2G/3G Low-Internet Lite Mode**: One-tap Navbar toggle (`2G/3G Lite`) optimized for weak rural mobile networks.
- **Downloadable PDF Guides**: Every scheme card, detail modal, and Family Benefit Finder report includes a **Download Guide (PDF) / Print Checklist** button so citizens can carry a formatted document checklist and step-by-step guide to their nearest Sewa Kendra.

### 10. Multilingual Voice & AI Guidance (22 Scheduled Indian Languages)
- **Trilingual UI**: Full interface and scheme database localized in **English**, **Punjabi (ਗੁਰਮੁਖੀ)**, and **Hindi (हिन्दी)**.
- **22 Indian Voice Input & Auto-Speak Locales**: Voice search and spoken AI responses supporting Punjabi, Hindi, English, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Odia, Assamese, Urdu, Kashmiri, Dogri, Konkani, Maithili, Manipuri, Nepali, Bodo, Santhali, and Sindhi.
- **AI Advisors**:
  - **Jansahayak AI Chatbot**: Grounded conversational assistant with DPDP Act consent controls and offline fallback.
  - **Per-Scheme AI Advisor**: Customized eligibility verdict, benefit calculation, and document verification guide.
  - **AI Welfare Roadmap**: Comprehensive 5-point action plan for a citizen's profile.

### 11. Recharts Analytics, Documents & Application Tracking
- **Interactive Analytics Dashboard**: Visualizes scheme counts by category (`BarChart`) and profile eligibility breakdown (`PieChart`) with CSV export and print support.
- **Document Center & AI Document Scanner**: Interactive document checklist, readiness percentage, DigiLocker / Sewa Kendra issuing guide, and camera/file OCR document scanner.
- **30-Day Deadline Reminder Hub**: Tracks upcoming application cutoffs and e-KYC deadlines for saved and active schemes.
- **Application Journey Tracker**: Step-by-step progress tracker (`Discovered` → `Documents Ready` → `Applied` → `Approved` → `DBT Disbursed`) with printable summary sheets and automatic SMS/in-app status alerts.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React Icons, Motion |
| **Data Visualization** | Recharts 3 (`BarChart`, `PieChart`, `ResponsiveContainer`) |
| **Offline & PWA** | Service Worker (`sw.js`), Web App Manifest, `localStorage` Sync |
| **Backend Server** | Node.js, Express 4 (`tsx backend/server.ts`) |
| **AI & Search Providers** | Google Gemini (`@google/genai`), Groq API Fallback, Tavily `.gov.in` Grounding |
| **Authentication & Cloud Sync** | Local Device Account (`localAuth.ts`) + Optional Supabase Auth & PostgreSQL (`@supabase/supabase-js`) |
| **Testing** | Node.js Built-in Test Runner (`node:test`, `node:assert/strict`) via `tsx --test` |

---

## Project Structure

```text
/
├── backend/
│   ├── data/
│   │   └── schemes.json              # Canonical backend scheme dataset
│   ├── supabase/
│   │   └── schema.sql                # Optional Supabase PostgreSQL schema
│   ├── adminAuth.ts                  # HMAC token & password verification for Admin Console
│   ├── chatUtils.ts                  # Multilingual prompt & assistant output parser
│   ├── providers.ts                  # Groq LLM & Tavily official .gov.in search helpers
│   ├── server.ts                     # Express API server + Vite middleware integration
│   └── *.test.ts                     # Backend unit tests
├── frontend/
│   ├── public/
│   │   ├── manifest.webmanifest      # PWA manifest
│   │   ├── sw.js                     # Offline-first Service Worker
│   │   └── janshayak-ai-logo.svg     # App icon & branding assets
│   ├── src/
│   │   ├── components/               # Modular React UI components, NotificationCenter, Compare & PhotoJawab modals
│   │   ├── data/                     # All-India 36 States/UTs, 780+ districts, schemes & translations
│   │   ├── lib/                      # Local auth, Supabase client & cloud sync helpers
│   │   ├── types/                    # TypeScript interfaces for schemes, profiles & evaluations
│   │   ├── utils/                    # Pure eligibility, sorting, comparison, notifications, SMS & offline engines
│   │   ├── App.tsx                   # Root application state & navigation controller
│   │   └── main.tsx                  # React DOM entry & Service Worker registration
│   ├── index.html                    # HTML entry with SEO, OpenGraph & JSON-LD structured data
│   └── vite.config.ts                # Vite configuration
├── shared/
│   └── types/
│       └── backend.ts                # Shared frontend/backend API contracts
├── ARCHITECTURE.md                   # System architecture & Mermaid diagrams
├── API_REFERENCE.md                  # REST API endpoint documentation
└── package.json                      # Scripts & dependencies
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
The application works out-of-the-box with zero API keys using its deterministic client/server engines and curated 36-State knowledge base. To enable live cloud AI, official web search grounding, or Supabase cloud sync, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available configuration variables in `.env`:
```env
# Optional AI & Official Search Grounding
GEMINI_API_KEY=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY=

# Optional Admin Portal Password (defaults to safe built-in verification if unset)
ADMIN_PORTAL_PASSWORD=

# Optional Supabase Cloud Sync
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional CORS & API Base URL
CORS_ORIGINS=
VITE_API_BASE_URL=
```

### 4. Start the Development Server
```bash
npm run dev
```
This launches the full-stack Express + Vite server at **`http://localhost:3000`**.

### 5. Build for Production
```bash
npm run build
npm start
```

### 6. Run Unit Tests & Type Checking
```bash
# Run the full frontend & backend unit test suite (node:test via tsx)
npm test

# Run TypeScript type checking
npm run lint
```

---

## API Overview

All API endpoints are served from `/api/*` on port `3000` and include automatic offline fallbacks:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status, loaded schemes count, and configured providers. |
| `GET` | `/api/schemes` | Returns the canonical list of verified government welfare schemes. |
| `POST` | `/api/eligibility` | Evaluates a citizen profile against all schemes and returns match scores. |
| `POST` | `/api/chat` | Multilingual AI chatbot with `.gov.in` grounding and DPDP consent support. |
| `POST` | `/api/ai/advisor` | Per-scheme personalized eligibility verdict, benefits, and document advice. |
| `POST` | `/api/ai/profile-analysis` | Generates a 5-step Government Welfare Roadmap for a citizen profile. |
| `POST` | `/api/ai/photo-jawab` | Analyzes Ration Card, Bill, or Form photos/text (*"Ehde ch ki likheya aa, agge ki karna aa"*). |
| `POST` | `/api/ai/admin-discover` | Discovers/generates a new or classic government scheme + `.gov.in` portal. |
| `POST` | `/api/alerts/send-sms` | Dispatches AI Auto-SMS notifications for new schemes and completed citizen work. |
| `GET` | `/api/alerts/history` | Returns recent AI SMS alert dispatch logs. |
| `POST` | `/api/security/scan-url` | Deep website authenticity & anti-hacker WAF scanner (`Low`/`Medium`/`High` risk). |
| `POST` | `/api/security/deep-analyze` | Alias for deep website & phishing/payload inspection. |
| `GET` | `/api/admin/knowledge-base` | Retrieves the active scheme knowledge base. |
| `POST` | `/api/admin/unlock` | Authenticates Admin Console password and returns a session token. |
| `POST` | `/api/admin/knowledge-base` | Updates the live AI knowledge base override (requires Bearer token). |
| `GET` | `/api/supabase/status` | Checks backend Supabase & provider configuration status. |
| `POST` | `/api/supabase/sync` | Syncs citizen profile, saved schemes, and tracked applications to Supabase. |

For full request/response schemas, see [`API_REFERENCE.md`](./API_REFERENCE.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Citizen Fraud Protection & Official Helplines

All government welfare scheme applications in India are **100% free of bribery or private brokerage**. Never share your Aadhaar OTP, bank PIN, or pay speed money to unauthorized agents.

- **Punjab Citizen Grievance & Sewa Kendra Helpline**: `1100` (Toll-Free)
- **National Cyber Crime Reporting Helpline**: `1930` / [cybercrime.gov.in](https://cybercrime.gov.in)
- **Women Helpline**: `1091` / `181`
- **Childline Helpline**: `1098`
- **Kisan Call Center**: `1800-180-1551`
