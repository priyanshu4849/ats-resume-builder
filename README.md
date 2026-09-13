# ATS Resume Builder

A full-stack MERN application that helps you build, upload, and optimize resumes against real job descriptions using AI. It parses uploaded resumes into structured data, scores them against a job description like an Applicant Tracking System (ATS) would, suggests AI-rewritten bullet points, and exports a clean, ATS-safe PDF in one of three templates.

**Live demo:** [ats-resume-builder-ten-xi.vercel.app](https://ats-resume-builder-ten-xi.vercel.app)

---

## Features

- **Build from scratch** — a guided editor for personal info, education, experience, projects, and skills.
- **Upload an existing resume** — upload a PDF or DOCX and have it parsed into the same editable structure using Claude.
- **ATS match analysis** — paste a job description and get a 0–100 match score, a list of missing keywords, and up to three flagged weak bullet points with reasons.
- **AI bullet rewriting** — get an ATS-aligned rewrite of any flagged bullet, shown as a suggestion you copy in yourself — nothing is ever auto-overwritten.
- **PDF export, 3 templates** — Classic (plain, timeless), Modern (accent color, skill pills), and Minimal (compact spacing) — all single-column and ATS-safe (no tables, columns, or graphics that break resume parsers).
- **Auth** — JWT-based register/login, resumes scoped to their owner.
- **Dark mode** — system-aware by default, with a manual toggle that persists.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| File parsing | multer (upload), pdf-parse (PDF text), mammoth (DOCX text) |
| AI | Anthropic Claude API (resume extraction, ATS scoring, bullet rewriting) |
| PDF export | Puppeteer (renders a server-side HTML template to PDF) |
| Deployment | Render (backend) + Vercel (frontend) |

### Why two separate apps

The frontend and backend are deployed independently rather than as one app. The backend is a long-running Express process (it needs to stay alive to talk to MongoDB, Claude, and Puppeteer), so it lives on Render. The frontend is compiled by Vite into static HTML/CSS/JS with no server needed at runtime, so it's served from Vercel's CDN. The two only communicate over HTTP, via the API base URL configured through an environment variable (see below).

---

## Project structure

```
ATS-resume/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── api/client.js        # fetch wrapper, API base URL
│       ├── components/          # Layout, buttons, theme toggle, etc.
│       ├── context/              # Auth + Theme React contexts
│       ├── lib/theme.js         # shared Tailwind class constants
│       └── pages/               # Login, Register, Dashboard, Editor, Upload, Analyze
└── server/                      # Express backend
    ├── index.js                 # app entry point
    ├── models/                  # User, Resume (Mongoose schemas)
    ├── routes/                  # auth, users, resumes
    ├── middleware/               # JWT auth guard, multer upload config
    ├── services/                 # parsing, Claude calls, PDF generation
    │   └── templates/           # classic / modern / minimal PDF templates
    └── .puppeteerrc.cjs         # Puppeteer cache path (see Deployment notes)
```

---

## Prerequisites

- Node.js 18+
- A MongoDB connection string ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works fine)
- An [Anthropic API key](https://console.anthropic.com/)

---

## Local setup

### 1. Clone and install

```bash
git clone <this-repo-url>
cd ATS-resume

cd server && npm install
cd ../client && npm install
```

### 2. Configure the backend

Create `server/.env`:

```env
PORT=5050
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ats_resume_builder
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=<any long random string>
```

### 3. (Optional) Point the frontend at a non-default backend URL

The client defaults to `http://localhost:5050/api` in development. If your backend runs elsewhere, create `client/.env.local`:

```env
VITE_API_URL=http://localhost:5050/api
```

### 4. Run both apps

```bash
# terminal 1
cd server && node index.js

# terminal 2
cd client && npm run dev
```

Visit `http://localhost:5173`.

---

## Available scripts

**server/**
| Command | Description |
|---|---|
| `node index.js` | Start the API server |

**client/**
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

---

## API overview

All routes are mounted under `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns a JWT |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/users/me` | Protected — current user's profile |
| GET | `/resumes` | Protected — list the user's resumes |
| POST | `/resumes` | Protected — create a blank resume |
| POST | `/resumes/upload` | Protected — upload + parse a PDF/DOCX resume |
| GET | `/resumes/:id` | Protected — fetch one resume |
| PATCH | `/resumes/:id` | Protected — update resume fields (including `template`) |
| DELETE | `/resumes/:id` | Protected — delete a resume |
| POST | `/resumes/:id/analyze` | Protected — score the resume against a pasted job description |
| POST | `/resumes/:id/rewrite-bullet` | Protected — get an AI-rewritten version of one bullet |
| GET | `/resumes/:id/export-pdf?template=` | Protected — download the resume as a PDF (`classic`/`modern`/`minimal`) |

---

## Deployment

### Backend (Render)

1. New Web Service → connect this repo.
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node index.js`
5. Environment variables: `MONGODB_URI`, `ANTHROPIC_API_KEY`, `JWT_SECRET`
6. In MongoDB Atlas, make sure **Network Access** allows connections from anywhere (`0.0.0.0/0`) — Render doesn't have a fixed IP.

**Puppeteer on Render — two gotchas already fixed in this repo, kept here for reference:**
- Puppeteer downloads Chrome to `~/.cache` by default, which Render's build doesn't persist into the runtime container. `server/.puppeteerrc.cjs` redirects that cache into the project directory instead, which does persist.
- A cached `node_modules` can cause `npm install` to skip re-running install scripts, silently skipping the Chrome download. `server/package.json` has an explicit `postinstall: npx puppeteer browsers install chrome` so it always runs regardless of caching.
- Puppeteer's `page.setContent()` with `waitUntil: "networkidle0"` can hang indefinitely in a sandboxed container (Chrome's implicit favicon request never resolves). The PDF service uses `waitUntil: "domcontentloaded"` instead, which is correct anyway since the resume templates have zero external resources.

### Frontend (Vercel)

1. New Project → connect this repo.
2. **Root Directory:** `client`
3. **Framework Preset:** Vite
4. Environment variable: `VITE_API_URL` = `<your-render-backend-url>/api`
   - Set this as a **Config** variable, not **Secret** — Vercel's "Secret" type isn't inlined into the static build the way `VITE_`-prefixed variables need to be, and it's a public URL anyway (visible in any browser's Network tab regardless).
5. Deploy.

Render's free tier spins down after inactivity, so the first request after idling can take 30–60 seconds while it wakes back up — expected behavior on the free plan, not a bug.

---

## Notes on ATS-safe design

The PDF templates are deliberately plain: single-column layout, no tables, no text-in-images, no multi-column sections. This isn't a style choice — real ATS parsers extract resume text by reading the document's structure, and tables/columns/graphics are exactly what causes them to misread or drop content. All three templates keep that constraint while varying typography, color, and density.
