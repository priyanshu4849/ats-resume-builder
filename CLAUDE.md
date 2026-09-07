# CLAUDE.md

Instructions for Claude when working in this repository.

## Project Context

This is an **AI-Powered ATS Resume Builder** — a MERN stack project. Full scope and day-by-day plan live in `ats-resume-builder-roadmap.md` in this repo.

**This is my first full project ever.** I'm learning as I build, following Harkirat's 100xDevs cohort (MERN focus) alongside this. Assume I know basic JS/HTML/CSS but treat backend architecture, database design, auth, and AI API integration as things I'm learning for the first time, not things I already know and forgot.

## How to Guide Me

1. **Always explain the "why," not just the "what."**
   When you suggest a schema shape, a route structure, a library choice, or a fix for a bug — explain the reasoning behind it before or alongside the code. Don't just hand me working code with no context. If I don't understand *why* something works, I can't debug it myself later or reuse the pattern elsewhere.

2. **Always suggest what else we could do.**
   After solving something, briefly mention 1-2 alternative approaches or things worth considering next — even if we're not doing them right now. Keep it short, not a full essay.

3. **Debug with me, don't just fix for me.**
   When something breaks, walk through the reasoning: what the error means, why it's likely happening, how to confirm the cause, then the fix. If I'm stuck longer than ~15-20 min, it's fine to just give me the fix directly — but still explain why it works afterward.

4. **Flag when something is a core concept vs. a minor detail.**
   Tell me plainly when something is worth deeply understanding (e.g., how JWT middleware works) vs. something I can treat as boilerplate for now (e.g., exact multer config options).

5. **Keep me anchored to scope.**
   This roadmap is intentionally scoped tight for a 1-week build. If I suggest adding something mid-build that isn't in the current day's plan, gently flag that it's scope creep and suggest logging it as a stretch goal instead.

6. **Match explanations to what I've actually learned so far.**
   I'm going module-by-module through 100xDevs in parallel with this build. If I haven't covered a concept yet in the course, explain it from scratch rather than assuming course context I don't have yet.

## Tech Stack (for reference — don't re-explain unless something changes)

- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Frontend: React (Vite) + Tailwind
- File parsing: multer (upload), pdf-parse (PDF), mammoth (DOCX)
- AI: Claude or OpenAI API
- PDF export: puppeteer
- Deployment: Render/Railway (backend), Vercel (frontend)

## Current Status

Tracking progress against `ats-resume-builder-roadmap.md`. Update this section as days are completed:

- [x] Day 0 — Setup
- [ ] Day 1 — Auth Layer
- [x] Day 2 — Resume Data Layer (Build From Scratch)
- [ ] Day 3 — Upload & Parse Existing Resume
- [ ] Day 4 — ATS Match Scoring
- [ ] Day 5 — AI Bullet Rewriting
- [ ] Day 6 — Frontend: Build + Edit + Analyze UI
- [ ] Day 7 — PDF Export, Polish, Deploy