# ATS Resume Builder

A full stack MERN application that helps you build, upload, and optimize resumes against real job descriptions using AI. It parses uploaded resumes into structured data, scores them against a job description like an Applicant Tracking System (ATS) would, finds keyword gaps, rewrites weak bullet points (one at a time or the whole resume at once), and exports a clean, ATS safe PDF in one of three templates.

**Live demo:** [ats-resume-builder-ten-xi.vercel.app](https://ats-resume-builder-ten-xi.vercel.app)

---

## Features

- **Build from scratch** — a guided editor for personal info, education, experience, projects, and skills.
- **Upload an existing resume** — upload a PDF or DOCX and have it parsed into the same editable structure using Claude.
- **ATS match analysis** — paste a job description and get an animated 0–100 match score, a side by side matched/missing keyword list, and inline highlighting of weak bullet points with the reason each was flagged.
- **AI bullet rewriting** — rewrite any flagged bullet and review it as a real word level diff (additions/removals highlighted) before accepting, regenerating, or rejecting it. Accepting saves it straight to the resume.
- **One-click "Rewrite my resume for this job"** — rewrites every flagged bullet and proposes missing keywords as new skills in one reviewable batch, with a checkbox per item.
- **PDF export, 3 templates** — Classic (plain, timeless), Modern (accent color, skill pills), and Minimal (compact spacing) — all single column and ATS safe (no tables, columns, or graphics that break resume parsers), with real screenshot thumbnails in the picker instead of text labels.
- **Auth, with account recovery** — JWT based register/login, resumes scoped to their owner, plus a full forgot/reset password flow by email.
- **Dark mode** — system-aware by default, with a manual toggle that persists.
- **A public landing page** for logged out visitors, with everything else behind auth.

### Hardening

- NoSQL injection guard on every auth route (rejects non string `email`/`password`/`name`/`token` fields before they ever reach a MongoDB query).
- CORS restricted to the deployed frontend's origin (with a safe fallback if the env var is ever unset).
- `helmet` security response headers (CSP, HSTS, X-Frame-Options, etc.).
- File uploads must match an allowed MIME type **and** extension, not just one.
- Rate limiting on auth routes and every route that calls Claude or runs Puppeteer.
- Accessibility pass, labeled form fields, visible focus states, and errors announced via `role="alert"`.
- A real automated test suite (auth, resume CRUD, bullet/resume rewriting, JSON parsing edge cases) run against an in memory MongoDB, not mocks.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Email | Resend (forgot/reset-password emails) |
| File parsing | multer (upload), pdf parse (PDF text), mammoth (DOCX text) |
| AI | Anthropic Claude API (resume extraction, ATS scoring, keyword suggestions, bullet/resume rewriting) |
| PDF export | Puppeteer (renders a server side HTML template to PDF) |
| Security | helmet, cors, express rate limit |
| Testing | Jest, Supertest, mongodb memory server |
| Deployment | Render (backend) + Vercel (frontend) |

### Why two separate apps

The frontend and backend are deployed independently rather than as one app. The backend is a long running Express process (it needs to stay alive to talk to MongoDB, Claude, and Puppeteer), so it lives on Render. The frontend is compiled by Vite into static HTML/CSS/JS with no server needed at runtime, so it's served from Vercel's CDN. The two only communicate over HTTP, via the API base URL configured through an environment variable (see below).

---

## Project structure

```
ATS-resume/
├── client/                      # React frontend (Vite)
│   ├── vercel.json              # SPA rewrite (see Deployment notes)
│   └── src/
│       ├── api/client.js        # fetch wrapper, API base URL
│       ├── components/          # Layout, buttons, theme toggle, spinner, etc.
│       ├── context/              # Auth + Theme React contexts
│       ├── lib/theme.js         # shared Tailwind class constants
│       └── pages/               # Landing, Login, Register, Dashboard, Editor, Upload, Analyze, 404
└── server/                      # Express backend
    ├── index.js                 # connects MongoDB, starts the server
    ├── app.js                   # Express app: middleware + routes (imported by index.js and by tests)
    ├── models/                  # User, Resume (Mongoose schemas)
    ├── routes/                  # auth, users, resumes
    ├── middleware/               # JWT auth guard, multer upload config, rate limiters
    ├── services/                 # parsing, Claude calls, PDF generation, email
    │   └── templates/           # classic / modern / minimal PDF templates
    ├── scripts/
    │   ├── generateTemplatePreviews.js  # renders each PDF template with sample data → PNG thumbnails
    │   └── generateOGImage.js           # renders the social-share preview card → PNG
    ├── tests/                   # Jest + Supertest, against an in-memory MongoDB
    └── .puppeteerrc.cjs         # Puppeteer cache path (see Deployment notes)
```

The template picker in the resume editor shows a screenshot of each template (`client/public/template-previews/*.png`) rather than plain text. These are generated once, not at runtime — if you change a template's HTML/CSS in `server/services/templates/`, regenerate them:

```bash
cd server && npm run generate:previews
```

Same idea for the social-share preview image (`client/public/og-image.png`, used by Open Graph/Twitter Card tags) — regenerate it if the landing page's hero copy changes:

```bash
cd server && npm run generate:og-image
```

---

## Prerequisites

- Node.js 18+
- A MongoDB connection string ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier works fine)
- An [Anthropic API key](https://console.anthropic.com/)
- A [Resend API key](https://resend.com/) (only needed for forgot/reset password emails — everything else works without it)

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
RESEND_API_KEY=re_...
CLIENT_URL=http://localhost:5173
```

`CLIENT_URL` is the only origin CORS will trust set it to wherever your frontend actually runs (see the CORS gotcha under Deployment).

### 3. (Optional) Point the frontend at a non default backend URL

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
| `npm test` | Run the Jest test suite (spins up an in memory MongoDB) |
| `npm run generate:previews` | Regenerate the PDF template thumbnail images |
| `npm run generate:og-image` | Regenerate the social-share preview image |

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
| POST | `/auth/forgot-password` | Email a password reset link, if the address has an account |
| POST | `/auth/reset-password` | Set a new password using the token from that email |
| GET | `/users/me` | Protected — current user's profile |
| GET | `/resumes` | Protected — list the user's resumes |
| POST | `/resumes` | Protected — create a blank resume |
| POST | `/resumes/upload` | Protected — upload + parse a PDF/DOCX resume |
| GET | `/resumes/:id` | Protected — fetch one resume |
| PATCH | `/resumes/:id` | Protected — update resume fields (including `template`) |
| DELETE | `/resumes/:id` | Protected — delete a resume |
| GET | `/resumes/:id/bullet-quality` | Protected — flag weak bullets by pattern (filler openers, no metrics, passive voice) |
| POST | `/resumes/:id/analyze` | Protected — score the resume against a pasted job description |
| POST | `/resumes/:id/rewrite-bullet` | Protected — get an AI rewritten version of one bullet |
| POST | `/resumes/:id/suggest-keyword-placement` | Protected — suggest where a missing keyword could fit |
| POST | `/resumes/:id/rewrite-resume` | Protected — rewrite every weak bullet and propose missing keyword skills in one batch |
| GET | `/resumes/:id/export-pdf?template=` | Protected — download the resume as a PDF (`classic`/`modern`/`minimal`) |

---

## Deployment

### Backend (Render)

1. New Web Service → connect this repo.
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `node index.js`
5. Environment variables: `MONGODB_URI`, `ANTHROPIC_API_KEY`, `JWT_SECRET`, `RESEND_API_KEY`, `CLIENT_URL`
6. In MongoDB Atlas, make sure **Network Access** allows connections from anywhere (`0.0.0.0/0`) — Render doesn't have a fixed IP.

**Two gotchas already fixed in this repo, kept here for reference:**

- **`CLIENT_URL` must actually be set.** CORS is configured as `cors({ origin: process.env.CLIENT_URL || "<fallback>" })`. If that env var is ever missing *and* the fallback is ever removed, the `cors` package treats an explicitly-`undefined` origin as "trust no one" — not "trust everyone" like you'd expect from the old wide open `cors()` default which silently breaks every request from the real frontend with no useful error beyond a browser-side "Failed to fetch."
- **Puppeteer on Render:**
  - Puppeteer downloads Chrome to `~/.cache` by default, which Render's build doesn't persist into the runtime container. `server/.puppeteerrc.cjs` redirects that cache into the project directory instead, which does persist.
  - A cached `node_modules` can cause `npm install` to skip re-running install scripts, silently skipping the Chrome download. `server/package.json` has an explicit `postinstall: npx puppeteer browsers install chrome` so it always runs regardless of caching.
  - `page.setContent()` with `waitUntil: "networkidle0"` can hang indefinitely in a sandboxed container (Chrome's implicit favicon request never resolves). The PDF service uses `waitUntil: "domcontentloaded"` instead, which is correct anyway since the resume templates have zero external resources.

### Frontend (Vercel)

1. New Project → connect this repo.
2. **Root Directory:** `client`
3. **Framework Preset:** Vite
4. Environment variable: `VITE_API_URL` = `<your-render-backend-url>/api`
   - Set this as a **Config** variable, not **Secret** — Vercel's "Secret" type isn't inlined into the static build the way `VITE_`-prefixed variables need to be, and it's a public URL anyway (visible in any browser's Network tab regardless).
5. Deploy.

**`client/vercel.json` matters.** The app uses React Router's `BrowserRouter` (real URL paths, not hash-based), so a direct visit or refresh on any route other than `/` needs Vercel to serve `index.html` and let React Router take over client side — otherwise it's a literal file lookup that 404s. `vercel.json`'s catch-all rewrite (`"/(.*)" → "/"`) handles this.

Render's free tier spins down after inactivity, so the first request after idling can take 30–60 seconds while it wakes back up expected behavior on the free plan, not a bug.

---

## Notes on ATS safe design

The PDF templates are deliberately plain: single column layout, no tables, no text in images, no multi column sections. This isn't a style choice real ATS parsers extract resume text by reading the document's structure, and tables/columns/graphics are exactly what causes them to misread or drop content. All three templates keep that constraint while varying typography, color, and density.
