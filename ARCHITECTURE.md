# System Architecture — JanSahayak AI (`ARCHITECTURE.md`)

**JanSahayak AI (ਪੰਜਾਬ ਅਤੇ ਭਾਰਤ ਸਰਕਾਰੀ ਸਕੀਮ ਨੈਵੀਗੇਟਰ)** is a **Hybrid Online + Offline Progressive Web Application (PWA)** engineered for pan-India citizen welfare discovery across all **36 States & Union Territories (28 States + 8 UTs)** and **780+ Districts**, featuring **Dynamic Occupation & Location Eligibility Matching** and an **Anti-Hacker & Website Authenticity Cyber Fraud Shield**.

---

## 1. High-Level Hybrid Online + Offline Architecture (Mermaid Diagram)

```mermaid
flowchart TB
  subgraph Client["Client Layer (React 19 + TypeScript + Tailwind v4 PWA)"]
    UI["Trilingual UI (Punjabi / Hindi / English)"]
    OccBar["Occupation + Custom Location + Live Eligibility Bar"]
    Analytics["Recharts Analytics Tab (Category & Profile Eligibility)"]
    CyberUI["Cyber Fraud Website Scanner & Anti-Hacker WAF Shield"]
    SW["Service Worker v3 (frontend/public/sw.js)"]
    LocalStore["Offline Persistence (localStorage + Indexed Cache)"]
  end

  subgraph CoreEngines["Deterministic Client Engines (100% Offline-Ready)"]
    SchemeEngine["Rule-Based Eligibility Engine (schemeEngine.ts)"]
    PresetEngine["Dynamic Occupation & Location Resolver (cyberFraudScanner.ts)"]
    StateRegistry["Pan-India 36 States/UTs & 780+ Districts (indiaStatesAndDistricts.ts)"]
    ThreatEngine["Website Authenticity & Anti-Hacker WAF (analyzeWebsiteAndCyberThreat)"]
    AutoAdmin["Autonomous AI Admin Sync Engine (12s Interval + Offline Pool)"]
  end

  subgraph Backend["Server Layer (Node.js + Express /backend/server.ts)"]
    API_Schemes["GET /api/schemes & POST /api/check-eligibility"]
    API_Chat["POST /api/chat & POST /api/ai/scheme-advisor"]
    API_Discover["POST /api/ai/admin-discover (Live AI Scheme Generator)"]
    API_Security["POST /api/security/scan-url (SSRF-Safe Live URL Probe)"]
  end

  subgraph External["Cloud & Official Government Ecosystem"]
    Gemini["Gemini 3.8 Flash (@google/genai) + Groq Fallback"]
    Tavily["Tavily Official .gov.in / .nic.in Grounding"]
    Supabase["Supabase Auth + PostgreSQL Cloud Sync"]
    GovPortals["Official .gov.in / .nic.in Portals & Helpline 1100 / 1930"]
  end

  UI --> OccBar
  UI --> Analytics
  UI --> CyberUI
  OccBar --> PresetEngine
  PresetEngine --> StateRegistry
  PresetEngine --> SchemeEngine
  SchemeEngine --> LocalStore
  CyberUI --> ThreatEngine
  CyberUI -->|Online Live Probe| API_Security
  AutoAdmin -->|Online| API_Discover
  AutoAdmin -->|Offline Fallback| StateRegistry
  SW <--> LocalStore
  UI -->|Online REST| API_Schemes
  UI -->|Online AI| API_Chat
  API_Chat --> Gemini
  API_Chat --> Tavily
  API_Discover --> Gemini
  API_Security --> GovPortals
  UI <-->|Optional Cloud Sync| Supabase
```

---

## 2. Dynamic Occupation, Category & Custom Location Eligibility Pipeline

Whenever a citizen selects an **Occupation** (`Student`, `Farmer`, `Homemaker / Women`, `Senior Citizen`, `Self-Employed`, `Daily Wage Worker`, `Unemployed Youth`), clicks a **Category**, or enters their **Custom Location** (`Village / City / Pincode / GPS`), the system dynamically computes tailored eligibility criteria and re-evaluates all Central and State schemes in `< 15ms`.

```mermaid
flowchart LR
  UserSelect["User Selects Occupation / Category\n(e.g., Student, Farmer, Senior, Women)"] --> PresetBuilder["buildDynamicEligibilityPreset()"]
  UserLocation["User Enters Custom Location\n(Village / City / 6-Digit PIN / GPS)"] --> LocationResolver["resolveLocationFromInputOrCoords()"]

  PresetBuilder --> ProfilePatch["Auto-Configures Profile Criteria:\n• Age & Income Threshold\n• Social Category (SC/OBC/EWS/Gen)\n• Landholding Acres\n• Student Enrollment Flag"]
  LocationResolver --> GeoMatch["Matches All-India Registry:\n• 36 States & Union Territories\n• 780+ Districts\n• PIN Prefix & Haversine GPS"]

  ProfilePatch --> LiveBar["Interactive Live Eligibility Bar\n(User can fine-tune Age, Income, Category, Land)"]
  GeoMatch --> LiveBar

  LiveBar --> EvalEngine["evaluateAllSchemes(profile, allSchemes)"]
  EvalEngine --> Results["Instant Output:\n• Eligible Schemes (Green)\n• Potential Match Schemes (Blue)\n• Recharts Analytics Distribution"]
```

---

## 3. Cyber Fraud Website Scanner & Anti-Hacker WAF Shield Flow

The **Cyber Fraud Shield (`CyberFraudShieldModal.tsx` + `cyberFraudScanner.ts` + `POST /api/security/scan-url`)** protects citizens against fake phishing portals, WhatsApp/SMS fee scams, malicious `.apk` trojans, and hacker exploit payloads (`SQL Injection`, `XSS`, `Path Traversal`).

```mermaid
sequenceDiagram
  autonumber
  actor Citizen as Citizen / User
  participant UI as CyberFraudShieldModal
  participant LocalWAF as analyzeWebsiteAndCyberThreat() (Client WAF)
  participant Backend as POST /api/security/scan-url (Express)
  participant GovDNS as Official .gov.in / .nic.in Edge

  Citizen->>UI: Paste Website URL, Domain, SMS Text, or .APK Link
  UI->>LocalWAF: Run Deep Heuristic & Signature Inspection
  LocalWAF->>LocalWAF: 1. Detect Hacker Payloads (SQLi, XSS, ../, .apk/.exe)
  LocalWAF->>LocalWAF: 2. Verify Hostname against Official .gov.in / .nic.in Registry
  LocalWAF->>LocalWAF: 3. Check Brand Spoofing, Lookalike Domains & Fee/OTP Lures
  LocalWAF-->>UI: Instant Verdict + Trust Score (0-100) + Official Replacement URL

  alt Device is Online & Host is Public Official Domain
    UI->>Backend: POST /api/security/scan-url { input }
    Backend->>Backend: SSRF Guard (Block localhost / 127.0.0.1 / 10.x / 192.168.x)
    Backend->>GovDNS: Fetch HTTP Status, Server Header & <title>
    GovDNS-->>Backend: HTTP 200 + NIC-Gov-Edge Metadata
    Backend-->>UI: Append Live Server Probe Verification
  else Device is Offline or Suspicious/Blocked Host
    UI->>UI: Enforce Zero-Trust Local Block & Show Official .gov.in Portal
  end

  UI-->>Citizen: Display Verdict (REAL_OFFICIAL_GOV / FAKE_PHISHING_SCAM / HACKER_MALICIOUS_BLOCKED)
```

---

## 4. Hybrid Online / Offline & Autonomous AI Admin State Diagram

```mermaid
stateDiagram-v2
  [*] --> AppBoot: Load App Shell & Service Worker (sw.js)
  AppBoot --> HydrateLocal: Load GOV_SCHEMES + 36 States/UTs + LocalStorage Cache

  state HydrateLocal {
    [*] --> ReadyOffline
    ReadyOffline: 100% Features Ready Offline\n(Eligibility, Analytics, Cyber Scanner, Tracker)
  }

  HydrateLocal --> OnlineMode: navigator.onLine == true
  HydrateLocal --> OfflineMode: navigator.onLine == false

  state OnlineMode {
    LiveAISync: AI Admin Polls /api/ai/admin-discover + Gemini 3.8 Flash
    CloudSync: Supabase Profile & Saved Schemes Sync
    LiveURLProbe: /api/security/scan-url Live HTTP Inspection
  }

  state OfflineMode {
    LocalPoolSync: AI Admin Auto-Discovers from Curated 36-State Pool
    LocalQueue: Profile, Tracker & Custom Location Saved in localStorage
    LocalCyberWAF: Deterministic URL & Anti-Hacker Scanner
  }

  OnlineMode --> OfflineMode: Network Disconnected (Zero Data Loss)
  OfflineMode --> OnlineMode: Network Restored (Auto Re-Sync)
```

---

## 5. Directory & Module Responsibilities

| Layer | File Path | Responsibility |
| :--- | :--- | :--- |
| **Frontend Entry & State** | `/frontend/src/App.tsx` | Master state for Citizen Profile, Dynamic Occupation/Location Bar, All-State Schemes, and Navigation Tabs. |
| **Cyber Fraud & Presets** | `/frontend/src/utils/cyberFraudScanner.ts` | Website Authenticity & Anti-Hacker WAF (`analyzeWebsiteAndCyberThreat`), Dynamic Occupation Presets (`buildDynamicEligibilityPreset`), and Custom Location / PIN / GPS Resolver (`resolveLocationFromInputOrCoords`). |
| **Cyber Shield UI** | `/frontend/src/components/CyberFraudShieldModal.tsx` | Interactive Website Scanner UI, Trust Score meter (`0–100`), Website Technical Intelligence grid, and Blocked Exploit log. |
| **Recharts Analytics** | `/frontend/src/components/DashboardInsights.tsx` | Interactive grouped BarChart and Donut PieChart visualizing scheme distribution by category and user eligibility. |
| **All-India Dataset** | `/frontend/src/data/indiaStatesAndDistricts.ts` | Complete directory of 36 Indian States & UTs, 780+ districts, district helplines, and pan-India welfare schemes. |
| **Offline PWA Engine** | `/frontend/public/sw.js` | Service Worker caching app shell, static assets, and `/api/schemes` responses for offline resilience. |
| **Backend API Server** | `/backend/server.ts` | Express API serving `/api/schemes`, `/api/check-eligibility`, `/api/chat`, `/api/ai/admin-discover`, and `/api/security/scan-url`. |
