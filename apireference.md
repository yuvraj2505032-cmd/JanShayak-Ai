# Janshayak AI — API Reference

Base URL: `http://localhost:3000`

## Endpoints Summary

- `GET /api/health` — Server health check, loaded schemes count, and provider status.
- `GET /api/schemes` — Fetch all government schemes (cached by Service Worker for offline mode).
- `POST /api/eligibility` — Evaluate citizen profile eligibility across all schemes (`eligibleSchemes`, `potentialSchemes`).
- `POST /api/chat` — Multilingual AI Voice & Chat Assistant (`pa`, `hi`, `en`) with `.gov.in` grounding and offline fallback (`generateOfflineChatReply`).
- `POST /api/ai/scheme-advisor` — Per-scheme personalized AI eligibility & document advisor with offline fallback (`generateOfflineSchemeAdvice`).
- `POST /api/ai/profile-analysis` — Full citizen profile AI Welfare Roadmap generator with offline fallback (`generateOfflineProfileRoadmap`).
- `POST /api/ai/admin-discover` — Autonomous AI Admin endpoint that discovers and adds new State & Central schemes, `.gov.in` portals, and YouTube guides (with offline autonomous synthesizer `generateAutonomousAiSchemeBundle`).
- `POST /api/admin/unlock` — Admin portal authentication returning an HMAC session token.
- `POST /api/admin/knowledge-base` — Admin CRUD synchronization for the live AI Knowledge Base.
- `GET /api/supabase/status` — Check cloud sync and provider configuration status.
- `POST /api/supabase/sync` — Sync citizen profile, saved schemes, and application tracker to Supabase (with local storage fallback).
