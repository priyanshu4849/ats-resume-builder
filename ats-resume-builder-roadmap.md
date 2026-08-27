# AI-Powered ATS Resume Builder — Build Roadmap

**What it does:**
1. **Build from scratch** — guided form → generates a clean, ATS-safe resume
2. **Edit existing resume** — upload a PDF/DOCX → it's parsed into editable fields → you improve it
3. **ATS Analysis** — paste a job description → get a match score + missing keywords + suggested bullet rewrites, powered by an LLM

This is a genuinely solid first project because it touches every layer of full-stack dev (auth, file handling, database, AI integration, PDF generation) without any one layer being too deep. We'll go day by day — watch a module, build that piece, move on. If anything breaks, bring it to me immediately, don't sit stuck.

---

## All the Layers (so you know what you're building before you start)

| Layer | What it's for | Tool |
|---|---|---|
| **Frontend** | Forms, resume editor, ATS score display | React (Vite) + Tailwind |
| **Backend/API** | Routes for resumes, auth, AI calls | Node.js + Express |
| **Database** | Store user accounts + saved resumes | MongoDB + Mongoose |
| **Auth** | Login/register, protect user's resumes | JWT |
| **File Upload & Parsing** | Read an uploaded PDF/DOCX into text | `multer` (upload) + `pdf-parse` (PDF) + `mammoth` (DOCX) |
| **AI/LLM Layer** | Extract resume sections, score against JD, rewrite bullets | Claude API or OpenAI API |
| **PDF Export** | Turn the final resume back into a downloadable PDF | `puppeteer` (renders your React resume template to PDF) |
| **Deployment** | Make it live for your CV link | Render/Railway (backend) + Vercel (frontend) |

You don't need to understand all of this today — each layer gets introduced on the day you build it.

---

## Data Model (reference — don't worry about memorizing, just for when you get to Day 1–2)

**User:** `{ name, email, passwordHash, createdAt }`

**Resume:** `{ userId, title, personalInfo: { name, email, phone, linkedin, github }, education: [], experience: [], projects: [], skills: [], source: "scratch" | "uploaded", rawUploadedText, createdAt, updatedAt }`

**ATS Analysis (embedded per resume-JD pair):** `{ resumeId, jdText, matchScore, missingKeywords: [], suggestedRewrites: [{ original, improved, reason }] }`

---

## Day-by-Day Plan

### Day 0 — Setup (1–2 hrs)
- Repo structure: `/client`, `/server`
- MongoDB Atlas cluster + connection string in `.env`
- Get your LLM API key (Claude or OpenAI — whichever you have), test **one** raw API call via Postman before writing app code, just to confirm it works
- **Deliverable:** Express server running, MongoDB connected, one successful test call to the LLM logged in console

### Day 1 — Auth Layer
- **Watch:** Your course's JWT auth module
- **Build:** User schema, register/login routes, password hashing (bcrypt), JWT middleware to protect routes
- **Deliverable:** Register + login working in Postman, can hit a protected `/me` route with a token

### Day 2 — Resume Data Layer (Build From Scratch)
- **Build:** Resume schema, CRUD routes — create a blank resume, add/update sections (personal info, education, experience, projects, skills) one at a time
- This is basically your Expense Tracker pattern again — same CRUD instincts, different schema shape
- **Deliverable:** Can create a resume and fill in all sections via Postman, all tied to the logged-in user

### Day 3 — Upload & Parse Existing Resume
- **Build:** Upload route using `multer` to accept a PDF or DOCX file
- **Build:** Extract raw text using `pdf-parse` (for PDFs) or `mammoth` (for DOCX)
- **Build:** Send that raw text to the LLM with a prompt asking it to return structured JSON matching your Resume schema (name, education, experience, skills, etc.)
- This is the trickiest day — LLM responses to parse aren't always clean JSON, so you'll practice validating/cleaning the response. I'll help you debug this live.
- **Deliverable:** Upload a real resume file → get back a structured, editable resume object saved to the DB

### Day 4 — ATS Match Scoring
- **Build:** A route that takes `{ resumeId, jobDescription }`, sends both to the LLM with a prompt like: *"Compare this resume against this JD. Return a match score 0-100, a list of missing keywords, and 3 specific weak bullet points."*
- **Build:** Store the analysis result, return it to the frontend
- **Deliverable:** POST a resume + JD → get back a score and a list of gaps

### Day 5 — AI Bullet Rewriting
- **Build:** A route that takes one resume bullet + the JD context and asks the LLM to rewrite it to be more ATS-aligned (natural keyword inclusion, stronger action verbs, quantified where possible)
- **Build:** Let the rewrite be a suggestion the user accepts/edits/rejects — never auto-overwrite silently
- **Deliverable:** Given a bullet + JD, get back an improved version you can accept or tweak

### Day 6 — Frontend: Build + Edit + Analyze UI
- **Watch:** React forms module if you need a refresher on controlled inputs
- **Build:**
  - "Start from scratch" form flow (step through sections)
  - "Upload existing resume" flow (upload → see parsed fields → edit)
  - ATS analysis view: paste JD, show score + missing keywords + rewrite suggestions inline
- **Deliverable:** All three core flows usable end-to-end in the browser

### Day 7 — PDF Export, Polish, Deploy
- **Build:** A clean, ATS-safe resume template (plain structure, no tables/columns/graphics) rendered in React, converted to PDF via `puppeteer` on the backend
- Deploy backend + frontend, test the full flow live
- Budget time for deploy issues (env vars, CORS) — this always takes longer than expected, that's normal
- Write your resume bullet for *this* project while it's fresh
- **Deliverable:** Live link + downloadable ATS-safe PDF resume generated by your own tool

---

## Resume Bullet (draft now, refine after building)
> Built a full-stack MERN application that parses resumes (PDF/DOCX) and job descriptions using an LLM API to generate ATS match scores, identify keyword gaps, and rewrite bullet points — with PDF export of the final ATS-optimized resume.

---

## Ground Rules
1. One module ahead, max. Watch → build immediately → next.
2. Stuck for 15–20 min? Bring it to me right away, don't grind alone.
3. Commit to GitHub after every day, even mid-feature. Your commit history is part of your credibility.
4. Day 3 and Day 4 are the hardest (parsing + AI prompting) — expect them to take longer, that's expected, not a sign you're behind.
5. No stretch goals until Day 7 is deployed and working.
