# System Architecture — JanSahayak AI (`artitecture.md`)

**JanSahayak AI (ਪੰਜਾਬ ਅਤੇ ਭਾਰਤ ਸਰਕਾਰੀ ਸਕੀਮ ਨੈਵੀਗੇਟਰ)** is a **Hybrid Online + Offline Progressive Web Application (PWA)** covering all **36 Indian States & Union Territories** and **780+ Districts**, with **Dynamic Occupation & Custom Location Eligibility** and an **Anti-Hacker Website Authenticity Scanner**.

---

## 1. Full-Stack Hybrid Architecture Diagram (Mermaid)

```mermaid
flowchart TB
  subgraph Client["Client Layer (React 19 + TypeScript + Tailwind v4 PWA)"]
    UI["Trilingual Citizen UI (Punjabi / Hindi / English)"]
    OccLocBar["Occupation + Custom Location + Live Eligibility Bar"]
    AnalyticsTab["Recharts Analytics Tab (Category & Eligibility Charts)"]
    CyberModal["Cyber Fraud Website Scanner & Anti-Hacker WAF Shield"]
    SW["Offline Service Worker (frontend/public/sw.js)"]
  end

  subgraph LocalEngines["Deterministic Local Engines (Online & Offline)"]
    Eval["Eligibility Engine (schemeEngine.ts)"]
    Preset["Occupation & Location Preset Engine (cyberFraudScanner.ts)"]
    IndiaDB["36 States/UTs & 780+ Districts (indiaStatesAndDistricts.ts)"]
    WAF["Website Authenticity & Exploit Scanner (analyzeWebsiteAndCyberThreat)"]
  end

  subgraph Server["Express Backend (/backend/server.ts)"]
    ApiSchemes["GET /api/schemes & POST /api/check-eligibility"]
    ApiAi["POST /api/chat & POST /api/ai/admin-discover"]
    ApiSec["POST /api/security/scan-url (SSRF-Safe Live Website Probe)"]
  end

  UI --> OccLocBar
  UI --> AnalyticsTab
  UI --> CyberModal
  OccLocBar --> Preset
  Preset --> IndiaDB
  Preset --> Eval
  CyberModal --> WAF
  CyberModal -->|Online| ApiSec
  UI -->|Online| ApiSchemes
  UI -->|Online| ApiAi
  SW <--> UI
```

---

## 2. Dynamic Occupation, Category & Custom Location Eligibility Flow

```mermaid
flowchart LR
  A["Select Occupation / Category\n(Student, Farmer, Women, Senior, Business)"] --> B["buildDynamicEligibilityPreset()"]
  C["Enter Custom Location\n(Village / City / Pincode / GPS)"] --> D["resolveLocationFromInputOrCoords()"]
  B --> E["Live Eligibility Criteria Bar\n(Age, Income, Category, Land, Student Status)"]
  D --> E
  E --> F["evaluateAllSchemes(profile, allSchemes)"]
  F --> G["Instant Eligible & Potential Scheme Matches\nAcross All 36 States & Central Ministries"]
```

---

## 3. Cyber Fraud Website Scanner & Anti-Hacker WAF Sequence

```mermaid
sequenceDiagram
  actor User as Citizen
  participant Scanner as CyberFraudShieldModal
  participant Engine as analyzeWebsiteAndCyberThreat()
  participant Server as POST /api/security/scan-url

  User->>Scanner: Enter Website URL, SMS Link, or Suspicious Payload
  Scanner->>Engine: Inspect Domain, TLD, SSL, Brand Spoofing & Exploit Vectors
  Engine-->>Scanner: Return Verdict (REAL_OFFICIAL_GOV / FAKE_PHISHING_SCAM / HACKER_MALICIOUS_BLOCKED) + Trust Score (0-100)
  opt Online Mode
    Scanner->>Server: Probe Live Official Header & Page Title (SSRF-Protected)
    Server-->>Scanner: Return HTTP Status, Server Header & Timestamp
  end
  Scanner-->>User: Show Website Intelligence Card + Safe Official .gov.in Replacement Link
```
