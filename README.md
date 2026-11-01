# 🇮🇳 Government Scheme Chatbot - G2

An AI-powered chatbot to help citizens discover and understand Indian Government schemes in simple language.

Built with Gemini AI + Supabase + Vite + TypeScript.

### 🚀 Live Demo
[Add your Vercel link here after deployment]

### ✨ Features
- Ask in Punjabi / Hindi / English - Bot understands all
- Find schemes by age, income, caste, location
- AI based eligibility check
- Voice search support
- Real-time data from government sources via Tavily API

### 🛠️ Tech Stack
- **Frontend:** Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js (server.ts), Bun
- **AI:** Google Gemini API
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

For deployments where the frontend and API are hosted separately (for example, this Vercel frontend with its Render Express API), `vercel.json` proxies `/api/*` requests to the configured Render service. For a different backend host, set the frontend build variable `VITE_API_BASE_URL` to that backend origin (no trailing slash), and add the deployed frontend's exact origin to the backend's `CORS_ORIGINS`. Leave `VITE_API_BASE_URL` empty when the frontend and API share an origin or Vercel's API rewrite is being used.

### Accounts and saved data

Use **On this device** to create a local account without configuring Supabase. The password is stored as a salted PBKDF2 hash, and account data stays in that browser on that device. Local accounts do not sync across devices and cannot be recovered if browser data is cleared. Choose **Cloud sync** instead to use a configured Supabase project.
