🇮🇳 Janshayak AI — Government Scheme Navigator (G2)
An AI-powered citizen welfare navigator and multilingual chatbot designed to help citizens discover, verify eligibility, calculate benefits, and apply for Punjab State and Central Government schemes in simple language (Punjabi / ਪੰਜਾਬੀ, Hindi / हिन्दी, and English).
Built with React 19 + Vite + TypeScript + Tailwind CSS + Express + Google Gemini AI / Groq + Supabase + Tavily API.
🚀 Live Demo
https://jan-shayak.vercel.app/
✨ Complete Website Features (ਵੈੱਬਸਾਈਟ ਦੀਆਂ ਸਾਰੀਆਂ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ)
1. 🗣️ Multilingual UI & Voice-Enabled AI Assistant (ਪੰਜਾਬੀ, ਹਿੰਦੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ)
3-Language Interface: Instant one-click switching between English, Punjabi (ਗੁਰਮੁਖੀ), and Hindi (हिन्दी) across the entire platform.
Voice Welcome & Speech Synthesis: Automatic spoken welcome greeting in the user's selected language and text-to-speech playback for scheme guidance.
Voice & Text Chatbot (ChatbotDrawer):
Built-in microphone voice input (Speech-to-Text) and conversational memory.
Grounded answers backed by the verified government scheme database and live .gov.in search via Tavily API.
Multi-provider AI resilience (Google Gemini AI primary, Groq LLM fallback, and deterministic offline rule-based fallback).
Smart in-app actions: the assistant can automatically search, filter categories, or navigate tabs when asked.
Privacy-first opt-in consent before sending queries to external AI/search providers.
2. 🎯 Smart Citizen Profile & Instant Eligibility Engine
Interactive Profile Wizard (ProfileWizard): Captures citizen demographics including Age, Gender, Occupation, Annual Household Income, Social Category (General, SC, BC/OBC, EWS, Minority), Punjab District (all 23 districts), Punjab Domicile status, Agricultural Landholding (in acres), Disability status, Widow/Destitute status, and School/College Enrollment.
Real-Time Eligibility Evaluation (schemeEngine): Automatically evaluates every scheme against the citizen's profile and classifies results into:
Confirmed Eligible (100% criteria met)
High Potential Match (70%+ match score)
Not Eligible (with transparent reasons showing exact satisfied and failed conditions)
Quick Occupation Switcher: Instant profile presets for Student, Farmer, Daily Wage Worker, Self-Employed, Unemployed Youth, Senior Citizen, and Homemaker.
3. 🔍 Smart Dashboard & Advanced Multi-Filter Search
Smart Eligibility Search Bar (SmartEligibilitySearchBar): Search schemes in English, Punjabi, or Hindi by name, ministry, keyword, or life event.
Advanced Filtering (advancedSchemeFilter): Filter by Government Level (Punjab State, Central, Joint), Category (Agriculture, Education, Health, Social Security, Women & Child, Housing, Finance/Loan, Skill & Employment), Benefit Type (Direct Cash Transfer, Scholarship, Subsidy, Health Insurance, Pension, Loan), Eligibility Status (Eligible Only, Potential Match, Saved), and Deadline Urgency.
Top Recommended & Recently Viewed Schemes: Personalized top-3 high-impact recommendations and automatic tracking of recently viewed schemes with offline caching.
4. 🤖 AI Scheme Advisor & Personalized Welfare Roadmap
Per-Scheme AI Advisor (AiSchemeAdvisorModal): Generates a tailored assessment for any individual scheme—covering eligibility verdict, exact financial entitlement, critical documents requiring Sewa Kendra / Tehsildar verification, and step-by-step application guidance.
AI Full Profile Welfare Roadmap (AiProfileRoadmapModal): Audits the citizen's complete profile to build a prioritized action plan highlighting the top 3–5 highest-impact schemes, total estimated annual financial benefit in ₹ INR, strategic document preparation order, and family multiplier tips.
5. 🧮 Interactive Simulators, Calculators & Visual Analytics
"What-If" Eligibility Simulator (WhatIfSimulator): Interactive sandbox sliders that let citizens test how changes in age, annual income, landholding acres, category, occupation, disability, or student enrollment dynamically unlock or affect scheme eligibility in real time.
Multi-Year Benefit Estimator (benefitEstimator): Calculates estimated 1-year and 5-year cumulative financial benefits for schemes inside the Scheme Detail Modal.
Family Benefit Finder (FamilyBenefitFinder): Allows citizens to add multiple household members (parents, spouse, children, siblings) with individual profiles to discover combined family eligibility and total household annual welfare benefits.
Dashboard Insights & Charts (DashboardInsights): Visual analytics powered by Recharts displaying eligibility breakdowns, category distributions, and benefit coverage.
6. 📄 Smart Document Center & Document Scanner
Document Readiness Center (DocumentCenter & ViewAllDocumentsModal):
Interactive checklist of common government documents (Aadhaar linked with Mobile, Punjab Residence/Domicile Certificate, Caste/Income Certificate, NPCI-mapped Bank Passbook, Land Jamabandi, etc.).
Shows issuing authority (UIDAI, Sewa Kendra, Tehsildar, Revenue Dept) and DigiLocker availability.
Calculates real-time document readiness percentage for every scheme.
AI Document Scanner & Verifier (DocumentScannerModal): Scan or upload document images/files to verify required fields and automatically mark documents as owned in the citizen's checklist.
Print-Ready Summaries (printHelper): Clean, printer-friendly formatting for scheme checklists and application tracker summaries.
7. 📋 Application Lifecycle Tracker & Deadline Reminder Hub
Application Tracker (ApplicationTracker): Track personal scheme applications across statuses (Discovered, Documents Assembled, Submitted, Under Verification, Approved, Rejected), save official Application Reference Numbers (PB-...), and record start dates.
Deadline Reminder Hub & Alerts (DeadlineReminderHub & SavedDeadlineBanner): Monitors saved and eligible schemes for urgent or closing deadlines (Urgent, Closing Soon, Ongoing) so citizens never miss an application window.
8. 🏛️ 23-District Punjab Sewa Kendra & Official Portal Directory
District Portal Finder (DistrictPortalFinder): Complete directory for all 23 districts of Punjab with district headquarters, local Sewa Kendra info, official district .gov.in websites, and citizen helplines.
Verified Official Portals Hub (officialPortals): Filterable directory of official Punjab and Central Government portals (connect.punjab.gov.in, scholarships.punjab.gov.in, pmkisan.gov.in, beneficiary.nha.gov.in, etc.).
9. 🎥 Multilingual Video Guides Hub
Step-by-Step Video Tutorials (VideoGuidesHub & SchemeVideoTutorials): Curated YouTube video walkthroughs explaining online registration, e-KYC, and Sewa Kendra application processes in Punjabi, Hindi, and English.
10. 🛡️ Cyber Fraud Shield & Citizen Safety Toolkit
Cyber Fraud Shield (CyberFraudShieldModal & FraudProtectionBanner):
Built-in Official URL Verifier to check whether a link is a legitimate .gov.in / .nic.in portal or a suspicious phishing site.
Safety alerts warning citizens that all government scheme applications are 100% free and never require sharing OTPs or paying middlemen.
Direct quick-reference helplines: 1100 (Punjab Citizen & Sewa Kendra Helpline) and 1930 (National Cyber Crime Helpline).
11. 🔐 Dual Account System: Local Device Accounts & Supabase Cloud Sync
On-Device Local Account (localAuth): Create a password-protected account stored locally in the browser using salted PBKDF2 password hashing, with optional Google email linking and guest data import—no external database setup required.
Supabase Cloud Sync (SupabaseAccount & citizenCloudSync): Sign in with Email/Password or Google OAuth via Supabase to sync citizen profiles, saved schemes, owned documents, and tracked applications across multiple devices.
12. ⚙️ Admin Console & Autonomous AI Scheme Discovery
Secure Admin Portal (AdminConsole & adminAuth): Password-protected admin console (/api/admin/unlock) using signed, expiring bearer tokens and rate-limited login protection.
Knowledge Base Management (adminSchemeManager): Add new government schemes, edit existing scheme details, soft-delete or restore schemes, and live-sync the updated knowledge base to the backend AI server (/api/admin/knowledge-base).
Autonomous AI Scheme Discovery (/api/ai/admin-discover): Auto-scheduled and on-demand AI discovery engine that indexes both New (2025–2026) and Classic (Purani) Punjab & Central government schemes along with verified .gov.in portals and tutorial videos.
13. 📱 PWA Offline Support, Dark Mode & Accessibility
Progressive Web App (sw.js & offlineCache): Service worker caching for reliable access even on slow or intermittent rural internet connections.
Dark / Light Theme Toggle: Smooth dark mode support with persistent user preference and reduced-motion accessibility compliance.
🛠️ Tech Stack
Frontend: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Motion, Recharts
Backend: Node.js, Express (backend/server.ts), TypeScript (tsx)
AI Providers: Google Gemini API (@google/genai), Groq API fallback
Database & Auth: Supabase (@supabase/supabase-js) + PBKDF2 Local Device Auth
Live Official Web Search: Tavily Search API (.gov.in / .nic.in grounding)
⚙️ How to Run Locally
Clone the repository:
Bash
git clone https://github.com/yuvraj2505032-cmd/g2.git
cd g2
Install dependencies and start the development server:
Bash
npm install
npm run dev
Run unit tests:
Bash
npm test
🔧 AI Provider & Deployment Configuration
The Express API loads backend/.env first and then the root .env; environment variables already set by the hosting platform take precedence. Configure GEMINI_API_KEY and/or GROQ_API_KEY on the backend host. TAVILY_API_KEY enables official-source search. The chatbot only sends questions to third-party AI/search providers after the user opts in via its consent checkbox.
Set ADMIN_PORTAL_PASSWORD on the backend to choose the admin password; admin editing and deletion are enabled only after the backend verifies it. The backend issues a signed, expiring admin session token and requires it for knowledge-base updates. If unset, local development uses the built-in default password.
For deployments where the frontend and API are hosted separately (for example, this Vercel frontend with its Render Express API), vercel.json proxies /api/* requests to the configured Render service. For a different backend host, set the frontend build variable VITE_API_BASE_URL to that backend origin (no trailing slash), and add the deployed frontend's exact origin to the backend's CORS_ORIGINS. Leave VITE_API_BASE_URL empty when the frontend and API share an origin or Vercel's API rewrite is being used.
💾 Accounts & Saved Data
Use On this device to create a local account without configuring Supabase. The password is stored as a salted PBKDF2 hash, and account data stays in that browser on that device. Local accounts do not sync across devices and cannot be recovered if browser data is cleared. Choose Cloud sync instead to use a configured Supabase project.
