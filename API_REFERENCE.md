# Janshayak AI — API Reference

Base URL (Development & Production): `http://localhost:3000`

All endpoints support **Online Mode** (live Express + AI providers) and automatic **Offline Mode Fallback** via Service Worker (`/sw.js`) and client-side engines (`offlineCache.ts`, `schemeEngine.ts`, `indiaStatesAndDistricts.ts`).

---

## 1. Health & System Status

### `GET /api/health`
Returns server health, loaded schemes count, and configured provider status.

**Response (`200 OK`):**
```json
{
  "status": "ok",
  "service": "Punjab Scheme Navigator API (CTBF-AI-07)",
  "schemesLoaded": 54,
  "supabaseConfigured": false,
  "groqConfigured": false,
  "tavilyConfigured": false,
  "version": "2.1.0",
  "timestamp": "2026-11-06T12:00:00.000Z"
}
```

---

## 2. Government Schemes & Eligibility Engine

### `GET /api/schemes`
Returns the canonical list of verified government schemes (`Scheme[]`). Cached automatically by the Service Worker for offline access.

### `POST /api/eligibility`
Evaluates a citizen profile against all government schemes and returns ranked `eligible`, `potential`, and `ineligible` scheme matches.

**Request Body:**
```json
{
  "age": 20,
  "income": 120000,
  "occupation": "Student",
  "category": "SC",
  "state": "Punjab",
  "district": "Ludhiana",
  "gender": "Male",
  "landAcres": 0,
  "hasDisability": false,
  "isWidow": false
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "citizenSummary": {
    "age": 20,
    "income": 120000,
    "occupation": "Student",
    "category": "SC",
    "district": "Ludhiana",
    "gender": "Male"
  },
  "counts": {
    "eligible": 20,
    "potential": 27,
    "totalEvaluated": 54
  },
  "eligibleSchemes": [],
  "potentialSchemes": []
}
```

---

## 3. Multilingual AI Assistant & Advisors

### `POST /api/chat`
Processes citizen questions in Punjabi (`pa`), Hindi (`hi`), or English (`en`) with optional profile context and DPDP Act consent.
- **Online**: Uses Gemini / Groq + Tavily `.gov.in` search grounding.
- **Offline Fallback**: Uses `generateOfflineChatReply(message, userProfile, language, schemes)` in `offlineCache.ts`.

**Request Body:**
```json
{
  "message": "What scholarships are available for SC students?",
  "language": "en",
  "voiceLocale": "en-IN",
  "hasConsent": true,
  "userProfile": {
    "age": 20,
    "occupation": "Student",
    "annualIncome": 120000,
    "category": "SC",
    "state": "Punjab",
    "district": "Ludhiana"
  }
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "reply": "Based on your profile, here are the top verified scholarships...",
  "recommendedSchemeIds": ["post-matric-sc", "nsp-central-sector-scholarship"],
  "officialSources": [
    {
      "title": "Dr. Ambedkar Scholarship Portal",
      "url": "https://scholarships.punjab.gov.in"
    }
  ],
  "appAction": null,
  "timestamp": "2026-11-06T12:00:00.000Z"
}
```

---

### `POST /api/ai/scheme-advisor`
Generates personalized eligibility, benefit breakdown, document checklist, and step-by-step application guidance for a specific scheme.
- **Offline Fallback**: `generateOfflineSchemeAdvice(scheme, profile, language)`

**Request Body:**
```json
{
  "schemeId": "pm-kisan",
  "userProfile": { "age": 38, "occupation": "Farmer", "annualIncome": 120000 },
  "language": "pa"
}
```

---

### `POST /api/ai/profile-analysis`
Generates a comprehensive 5-point Government Welfare Roadmap for a citizen's full profile.
- **Offline Fallback**: `generateOfflineProfileRoadmap(profile, schemes, language)`

**Request Body:**
```json
{
  "userProfile": {
    "age": 20,
    "occupation": "Student",
    "annualIncome": 120000,
    "category": "SC",
    "state": "Punjab",
    "district": "Ludhiana"
  },
  "language": "en"
}
```

---

## 4. Autonomous AI Admin & Knowledge Base APIs

### `POST /api/ai/admin-discover`
Autonomously discovers and structures a new or classic government welfare scheme, its official `.gov.in` portal, and YouTube tutorial guide.
- **Offline / Autonomous Fallback**: `generateAutonomousAiSchemeBundle(existingSchemeIds, seedIndex)` in `indiaStatesAndDistricts.ts`.

**Request Body:**
```json
{
  "topic": "Haryana Student Laptop Scholarship",
  "era": "new"
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "source": "gemini-ai-admin",
  "scheme": {
    "id": "ai-custom-scheme-1793540000",
    "titleEn": "Haryana Student Laptop Scholarship",
    "level": "Haryana State",
    "officialPortalUrl": "https://saralharyana.gov.in"
  },
  "portal": {
    "id": "portal-ai-1793540000",
    "title": "Antyodaya Saral Haryana Portal",
    "url": "https://saralharyana.gov.in",
    "category": "All-India State Portals"
  }
}
```

### `POST /api/admin/unlock`
Verifies `ADMIN_PORTAL_PASSWORD` and issues a signed HMAC session token for Admin Console CRUD operations.

### `POST /api/admin/knowledge-base`
Updates the in-memory AI Knowledge Base override (requires `Authorization: Bearer <admin_token>`).

---

## 5. Cloud Sync APIs

### `GET /api/supabase/status`
Returns whether Supabase and external AI environment keys are configured.

### `POST /api/supabase/sync`
Synchronizes a citizen's saved schemes, tracked applications, owned documents, and profile with Supabase (`citizen_app_data`), falling back gracefully to `localStorage` when offline.
