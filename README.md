# 🇮🇳 Government Scheme Chatbot - G2

An AI-powered chatbot to help citizens discover and understand Indian Government schemes in simple language.

Built with Gemini AI + Supabase + Vite + TypeScript.

### 🚀 Live Demo
[https://jan-shayak.vercel.app/]

### ✨ Features
- Ask in Punjabi / Hindi / English - Bot understands all
- Find schemes by age, income, caste, location, and occupation
- Instant AI-based eligibility check (Eligible, Potential Match, Not Eligible)
- Voice search & spoken audio assistant support (Speech-to-Text & Text-to-Speech)
- Real-time data from official `.gov.in` sources via Tavily API
- Smart Citizen Profile Wizard
- AI Scheme Advisor & AI Full Profile Welfare Roadmap
- "What-If" Eligibility Simulator
- 1-Year & 5-Year Financial Benefit Estimator
- Family Benefit Finder (multi-member household calculator)
- Smart Document Checklist & AI Document Scanner
- Application Status Tracker & Printable Summaries
- Scheme Deadline Reminder Hub & Alerts
- All 23 Punjab Districts Sewa Kendra & Official Portal Finder
- Multilingual Step-by-Step Video Tutorials Hub
- Cyber Fraud Shield & Official `.gov.in` Link Verifier
- Dashboard Analytics & Visual Insights
- Bookmark / Save Schemes & Recently Viewed Offline Cache (PWA)
- Local Device Account (PBKDF2) & Supabase Cloud Sync with Google Sign-In
- Dark Mode / Light Mode Toggle
- Admin Console & Autonomous AI Scheme Discovery

### 🛠️ Tech Stack
- **Frontend:** Vite, React, TypeScript, Tailwind CSS
- **Backend:** Node.js (`server.ts`), Express
- **AI:** Google Gemini API, Groq API
- **Database:** Supabase
- **Search:** Tavily API

### ⚙️ How to Run Locally

1. Clone the repo
```bash
git clone https://github.com/yuvraj2505032-cmd/g2.git
cd g2
```

Install dependencies and start the app:

```bash
npm install
npm run dev
```

### AI provider and deployment configuration

The Express API loads `backend/.env` first and then the root `.env`; environment variables already set by the hosting platform take precedence. Configure `GROQ_API_KEY` and/or `GEMINI_API_KEY` on the backend host. `TAVILY_API_KEY` enables official-source search. The chatbot only sends questions to third-party AI/search providers after the user opts in via its consent checkbox.

Set `ADMIN_PORTAL_PASSWORD` on the backend to choose the admin password; admin editing and deletion are enabled only after the backend verifies it. The backend issues a signed, expiring admin session token and requires it for knowledge-base updates. If unset, local development uses the built-in default password.

For deployments where the frontend and API are hosted separately (for example, this Vercel frontend with its Render Express API), `vercel.json` proxies `/api/*` requests to the configured Render service. For a different backend host, set the frontend build variable `VITE_API_BASE_URL` to that backend origin (no trailing slash), and add the deployed frontend's exact origin to the backend's `CORS_ORIGINS`. Leave `VITE_API_BASE_URL` empty when the frontend and API share an origin or Vercel's API rewrite is being used.

### Accounts and saved data

Use **On this device** to create a local account without configuring Supabase. The password is stored as a salted PBKDF2 hash, and account data stays in that browser on that device. Local accounts do not sync across devices and cannot be recovered if browser data is cleared. Choose **Cloud sync** instead to use a configured Supabase project.
