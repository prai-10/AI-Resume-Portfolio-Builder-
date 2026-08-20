# AI Resume & Portfolio Builder

> A full-stack web application that generates professional, tailored resumes, cover letters, and portfolios using AI — built as a college project.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Design](#database-design)
7. [API Endpoints](#api-endpoints)
8. [AI Generation Flow](#ai-generation-flow)
9. [Environment Variables](#environment-variables)
10. [Demo Mode](#demo-mode)
11. [Local Setup](#local-setup)
12. [Deployment Guide](#deployment-guide)
13. [PDF Generation](#pdf-generation)
14. [Security](#security)
15. [How It Works — Viva Explanation](#how-it-works--viva-explanation)

---

## Problem Statement

> *"Many students struggle to present their skills and projects in an attractive, professional format. Generic resume templates don't highlight individual strengths. A generative AI solution is needed that can automatically generate tailored resumes, cover letters, and portfolios based on student data, improving job and internship opportunities."*

---

## Features

| Feature | Description |
|---|---|
| **Profile Builder** | Complete CRUD forms for personal info, education, skills, projects, experience, certifications, achievements, and links |
| **AI Resume Generator** | Generates tailored resumes using real profile data via OpenAI API or Demo Mode |
| **Cover Letter Generator** | Personalized cover letters for any company and job title |
| **Portfolio Builder** | Live portfolio preview assembled from stored profile data |
| **Two Resume Templates** | Modern (colored) and ATS-Friendly (plain text optimized) |
| **PDF Download** | Real PDF export using jsPDF + html2canvas — downloads the exact on-screen preview |
| **Saved Documents** | All generated resumes and cover letters stored in SQLite, viewable anytime |
| **Demo Mode** | Fully functional without an AI API key — uses stored profile data |
| **Dark Blue Theme** | Professional SaaS-style dark UI |
| **Responsive Design** | Works on desktop, tablet, and mobile |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18 |
| Frontend Build | Vite | 5 |
| Frontend Language | JavaScript (JSX) | ES2022 |
| Backend | Node.js + Express | 18+ / 4.x |
| Database | SQLite via sql.js | 1.x |
| AI Provider | OpenAI-compatible REST API | — |
| PDF Generation | jsPDF + html2canvas | 2.x / 1.x |
| Routing | React Router DOM | 6 |
| HTTP | node-fetch | 2.x |

---

## Architecture

```
┌─────────────────────────────────────┐
│         Browser (React + Vite)      │
│  • 7 pages, React Router            │
│  • Centralized api.js service layer │
│  • jsPDF + html2canvas for PDF      │
└────────────────┬────────────────────┘
                 │  REST API (JSON over HTTP)
                 │  /api/*
┌────────────────▼────────────────────┐
│      Express.js Server (Node.js)    │
│  • 10 route files                   │
│  • 9 controllers                    │
│  • aiService.js (AI + Demo Mode)    │
│  • dotenv for secrets               │
└────────────┬───────────┬────────────┘
             │           │
    ┌────────▼──────┐  ┌─▼──────────────────────┐
    │ SQLite (sql.js)│  │ AI Provider (optional)  │
    │ resume_builder │  │ OpenAI / Groq / Gemini  │
    │    .db file    │  │ via AI_API_KEY env var   │
    └───────────────┘  └────────────────────────┘
```

### Request Flow

```
User action in browser
  → React component calls api.js
    → fetch('/api/...') — proxied to Express in dev
      → Express route → controller → SQLite query
        → JSON response
          → React renders result
```

---

## Project Structure

```
AI Resume & Portfolio Builder/
│
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── ResumePreview.jsx    # A4 preview + template switch + PDF download
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Stats, quick actions, recent docs
│   │   │   ├── Profile.jsx          # Tabbed CRUD profile builder
│   │   │   ├── ResumeBuilder.jsx    # Resume generation form + preview
│   │   │   ├── AIGenerator.jsx      # AI generator with form + saved list
│   │   │   ├── CoverLetter.jsx      # Cover letter generator + preview
│   │   │   ├── Portfolio.jsx        # Portfolio preview from DB data
│   │   │   └── SavedDocuments.jsx   # All saved resumes + cover letters
│   │   ├── services/
│   │   │   └── api.js               # All fetch calls — single source of truth
│   │   ├── styles/
│   │   │   └── global.css           # Dark blue theme, all component styles
│   │   ├── App.jsx                  # Router + sidebar navigation
│   │   └── main.jsx                 # React DOM entry point
│   ├── index.html
│   ├── vite.config.js               # Dev proxy: /api → localhost:5000
│   ├── vercel.json                  # Vercel SPA rewrite rules
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── controllers/                 # Business logic — one file per entity
│   │   ├── profileController.js
│   │   ├── educationController.js
│   │   ├── skillsController.js
│   │   ├── projectsController.js
│   │   ├── experienceController.js
│   │   ├── certificationsController.js
│   │   ├── achievementsController.js
│   │   ├── linksController.js
│   │   └── generatedDocumentsController.js
│   ├── routes/                      # Express route handlers
│   │   ├── profile.js
│   │   ├── education.js
│   │   ├── skills.js
│   │   ├── projects.js
│   │   ├── experience.js
│   │   ├── certifications.js
│   │   ├── achievements.js
│   │   ├── links.js
│   │   ├── generatedDocuments.js
│   │   └── ai.js
│   ├── services/
│   │   └── aiService.js             # OpenAI integration + Demo Mode
│   ├── database/
│   │   └── init.js                  # sql.js setup, schema, queryAll/queryOne/execute
│   ├── data/                        # SQLite DB file lives here (gitignored)
│   │   └── resume_builder.db        # Auto-created on first startup
│   ├── server.js                    # Express app + startup
│   ├── .env.example                 # Template — copy to .env and fill in secrets
│   └── package.json
│
├── render.yaml                      # Render.com deployment config (backend)
├── .env.example                     # Root-level pointer
├── .gitignore                       # Covers .env, node_modules, data/, dist/
├── package.json                     # Root convenience scripts
└── README.md                        # This file
```

---

## Database Design

The SQLite database is **automatically created** at `server/data/resume_builder.db` on first backend startup. No manual setup required.

### Tables

#### `profile` — Singleton (always id = 1)
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK | Always 1 |
| full_name | TEXT | Student's full name |
| email | TEXT | Contact email |
| phone | TEXT | Phone number |
| location | TEXT | City, country |
| headline | TEXT | Professional headline |
| about | TEXT | Career objective / about me |
| created_at | TEXT | Timestamp |
| updated_at | TEXT | Timestamp |

#### `education`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| degree | TEXT NOT NULL | Degree / course name |
| institution | TEXT NOT NULL | University / college |
| start_year | TEXT | |
| end_year | TEXT | |
| cgpa | TEXT | CGPA or percentage |
| description | TEXT | Optional notes |

#### `skills`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| name | TEXT NOT NULL | Skill name |
| category | TEXT | technical / soft / tools |
| proficiency | TEXT | beginner / intermediate / advanced / expert |

#### `projects`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| name | TEXT NOT NULL | |
| description | TEXT | |
| technologies | TEXT | Comma-separated |
| project_url | TEXT | Live demo URL |
| github_url | TEXT | GitHub repo URL |
| contributions | TEXT | Key contributions (newline-separated) |

#### `experience`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| company | TEXT NOT NULL | |
| role | TEXT NOT NULL | Job title |
| start_date | TEXT | |
| end_date | TEXT | |
| is_current | INTEGER | 0 or 1 |
| responsibilities | TEXT | Newline-separated bullets |
| achievements | TEXT | Key achievements |
| location | TEXT | |

#### `certifications`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| name | TEXT NOT NULL | Certificate name |
| organization | TEXT NOT NULL | Issuing body |
| date | TEXT | |
| credential_url | TEXT | Verify link |
| credential_id | TEXT | |

#### `achievements`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| title | TEXT NOT NULL | |
| description | TEXT | |
| date | TEXT | |

#### `links`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| platform | TEXT NOT NULL | github / linkedin / portfolio / other |
| url | TEXT NOT NULL | |
| label | TEXT | Display name |

#### `generated_documents`
| Column | Type | Description |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| type | TEXT NOT NULL | resume / cover_letter |
| title | TEXT | Display title |
| target_role | TEXT | Job role targeted |
| target_company | TEXT | Company (cover letters) |
| job_description | TEXT | Pasted JD |
| template | TEXT | modern / ats |
| content | TEXT | Full JSON content |
| metadata | TEXT | JSON: mode, generatedAt |
| created_at | TEXT | |

---

## API Endpoints

### Profile
```
GET    /api/profile                  Get the single profile row
PUT    /api/profile                  Update profile fields
```

### Education
```
GET    /api/education                List all education entries
POST   /api/education                Add education  { degree*, institution* }
PUT    /api/education/:id            Update entry
DELETE /api/education/:id            Delete entry
```

### Skills
```
GET    /api/skills                   List all skills (ordered by category)
POST   /api/skills                   Add skill  { name*, category, proficiency }
PUT    /api/skills/:id               Update
DELETE /api/skills/:id               Delete
```

### Projects
```
GET    /api/projects                 List all (newest first)
POST   /api/projects                 Add  { name* }
PUT    /api/projects/:id             Update
DELETE /api/projects/:id             Delete
```

### Experience
```
GET    /api/experience               List all (current first, then by date)
POST   /api/experience               Add  { company*, role* }
PUT    /api/experience/:id           Update
DELETE /api/experience/:id           Delete
```

### Certifications
```
GET    /api/certifications           List all
POST   /api/certifications           Add  { name*, organization* }
PUT    /api/certifications/:id       Update
DELETE /api/certifications/:id       Delete
```

### Achievements
```
GET    /api/achievements             List all
POST   /api/achievements             Add  { title* }
PUT    /api/achievements/:id         Update
DELETE /api/achievements/:id         Delete
```

### Links
```
GET    /api/links                    List all
POST   /api/links                    Add  { platform*, url* }
PUT    /api/links/:id                Update
DELETE /api/links/:id                Delete
```

### Generated Documents
```
GET    /api/generated-documents      List all saved documents
GET    /api/generated-documents/:id  Get one document
DELETE /api/generated-documents/:id  Delete document
```

### AI
```
GET    /api/ai/status                { mode: "demo"|"live", model, message }
POST   /api/ai/generate-resume       { targetRole*, targetIndustry, jobDescription, template }
POST   /api/ai/generate-cover-letter { targetCompany*, jobTitle*, jobDescription }
GET    /api/ai/portfolio-data        All profile data for portfolio rendering
```

### Health
```
GET    /api/health                   { status: "OK", timestamp }
```

*Fields marked `*` are required.*

---

## AI Generation Flow

```
1.  Student fills profile (Profile Builder page)
         ↓
2.  Data saved to SQLite via PUT/POST REST APIs
         ↓
3.  Student opens AI Generator / Resume Builder
    → Enters target role + optional industry + job description
         ↓
4.  Frontend POST /api/ai/generate-resume
         ↓
5.  Backend (aiService.js) loads ALL profile data from SQLite:
    profile + education + skills + projects +
    experience + certifications + achievements + links
         ↓
6.  If AI_API_KEY is set (Live AI):
      → Builds structured prompt with student data
      → POST to OpenAI-compatible API
      → Receives JSON response
      → Parses and validates JSON
      → On any error → falls back to Demo Mode automatically
    Else (Demo Mode):
      → Builds structured resume directly from database data
      → No external call made
         ↓
7.  Result saved to generated_documents table in SQLite
         ↓
8.  JSON returned to frontend
         ↓
9.  ResumePreview.jsx renders A4-styled HTML
    → User can switch Modern ↔ ATS template (no data loss)
         ↓
10. User clicks Download PDF
    → html2canvas captures the DOM element as a canvas image
    → jsPDF creates a properly-sized PDF document
    → Browser downloads resume.pdf
```

### Factual Accuracy Guarantee

The AI prompt explicitly instructs the model:
> *"NEVER invent or add qualifications, companies, projects, skills, or achievements not provided by the student. You may ONLY rephrase, improve clarity, and organize existing information."*

In Demo Mode, only stored data is used — nothing is invented.

---

## Environment Variables

### Backend — `server/.env`

```env
# AI Provider (leave AI_API_KEY blank for Demo Mode)
AI_API_KEY=sk-...              # OpenAI key OR compatible provider key
AI_MODEL=gpt-3.5-turbo         # Model name
AI_BASE_URL=https://api.openai.com/v1   # Override for other providers

# Server
PORT=5000                      # Render assigns this automatically
NODE_ENV=development            # Set to production on deploy

# CORS — set to your Vercel URL after deploying
CLIENT_URL=http://localhost:5173
```

### Frontend — `client/.env.local` (only needed in production)

```env
# Only set this when frontend and backend are on different domains
VITE_API_URL=https://your-api.onrender.com
```

### Alternative AI Providers

| Provider | AI_MODEL | AI_BASE_URL |
|---|---|---|
| OpenAI | `gpt-3.5-turbo` | `https://api.openai.com/v1` |
| Groq (free) | `llama3-8b-8192` | `https://api.groq.com/openai/v1` |
| Google Gemini | `gemini-1.5-flash` | `https://generativelanguage.googleapis.com/v1beta/openai` |

---

## Demo Mode

When `AI_API_KEY` is **not set**, the application runs fully in Demo Mode:

- Resume generation reads all stored profile data from SQLite
- Structures it into sections: summary, skills, experience, projects, education
- Generates a professional objective based on target role
- No external API call is made
- All features remain available
- The generated resume uses **real student data only**

The Dashboard and AI Generator show a `🟡 Demo Mode` badge when active.

---

## Local Setup

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-resume-builder.git
cd ai-resume-builder
```

### 2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment
```bash
# Copy example and add your settings
cp server/.env.example server/.env
# Edit server/.env — add AI_API_KEY if you have one
# Leave AI_API_KEY blank to use Demo Mode
```

### 4. Start the backend
```bash
cd server
node server.js
# → http://localhost:5000
# Database auto-created at server/data/resume_builder.db
```

### 5. Start the frontend
```bash
cd client
npm run dev
# → http://localhost:5173
```

### 6. Open in browser
**http://localhost:5173**

---

## Deployment Guide

### Stack
```
GitHub Repository
    ├── Backend  → Render.com  (https://your-api.onrender.com)
    └── Frontend → Vercel.com  (https://your-app.vercel.app)
```

---

### Step 1 — Push to GitHub

```bash
# In the project root
git init
git add .
git commit -m "Initial commit — AI Resume & Portfolio Builder"
git branch -M main
git remote add origin https://github.com/your-username/ai-resume-builder.git
git push -u origin main
```

> **Never commit `server/.env`** — it is in `.gitignore` and will not be pushed.

---

### Step 2 — Deploy Backend to Render

1. Go to **https://render.com** → Sign in → **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Runtime**: Node
4. Add **Environment Variables** in Render dashboard:
   ```
   AI_API_KEY       = sk-your-openai-key
   AI_MODEL         = gpt-3.5-turbo
   AI_BASE_URL      = https://api.openai.com/v1
   NODE_ENV         = production
   CLIENT_URL       = https://your-app.vercel.app   ← fill after Vercel deploy
   ```
5. Add a **Persistent Disk**:
   - Mount Path: `/opt/render/project/src/server/data`
   - Size: 1 GB (free tier available)
   - This keeps the SQLite database alive across deploys
6. Click **Deploy** — wait for `🚀 Server running` in logs
7. Copy your Render URL: `https://ai-resume-builder-api.onrender.com`

---

### Step 3 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → Sign in → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `client`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   ```
   VITE_API_URL = https://ai-resume-builder-api.onrender.com
   ```
5. Click **Deploy**
6. Copy your Vercel URL: `https://ai-resume-builder.vercel.app`

---

### Step 4 — Connect frontend URL to backend CORS

1. Go back to **Render dashboard** → Your service → **Environment**
2. Update:
   ```
   CLIENT_URL = https://ai-resume-builder.vercel.app
   ```
3. Render will auto-redeploy

---

### Step 5 — Verify deployment

Open `https://your-app.vercel.app` in browser:
- Dashboard loads ✅
- Profile save works ✅
- AI Generator shows Live AI (if key set) ✅
- PDF download works ✅

---

### SQLite on Render — Important Notes

| Scenario | Behaviour |
|---|---|
| Normal restart / redeploy | ✅ Data persists (persistent disk) |
| Free tier sleep (15 min inactivity) | ✅ Data persists — only RAM is cleared, disk survives |
| Service deleted and recreated | ❌ Disk is deleted — data lost |
| Free tier disk limit (1 GB) | ✅ More than enough for a college project |

**Recommendation**: Export your database occasionally using the Render shell if you want a backup.

---

## PDF Generation

PDF download is implemented entirely in the browser — no server-side processing needed.

**How it works:**
1. User clicks **Download PDF** on the Resume Preview
2. `html2canvas` captures the `.a4-paper` DOM element as a high-resolution canvas (2x scale)
3. `jsPDF` creates an A4-sized PDF document
4. The canvas is sliced into pages if the resume is longer than one page
5. The PDF is saved to the user's downloads folder

**Result**: The downloaded PDF is pixel-accurate to the on-screen preview. Both Modern and ATS templates produce clean PDFs suitable for job applications.

**Alternative**: Use browser **Print → Save as PDF** (Ctrl+P) on any page.

---

## Security

| Concern | How it is handled |
|---|---|
| API key exposure | Key lives only in `server/.env` — never sent to frontend, never in source code |
| API key in logs | Only mode/model logged — key value never printed |
| API error body | Raw error body sanitized — only the `error.message` field surfaced to client |
| Git commits | `.env`, `server/data/`, `node_modules/`, `client/dist/` all in `.gitignore` |
| CORS | Only the origins listed in `CLIENT_URL` env var are allowed |
| Frontend env vars | `VITE_*` vars are safe for public data only — never put secrets there |

---

## How It Works — Viva Explanation

### Q: What problem does this solve?
Students often struggle to write professional resumes. This app takes all their information once (education, skills, projects, experience) and uses AI to generate tailored, ATS-friendly resumes for any job role they target.

### Q: Explain the architecture.
The app has three layers:
- **Frontend** (React + Vite) — the user interface running in the browser
- **Backend** (Node.js + Express) — REST API server that handles data and AI
- **Database** (SQLite) — stores all student data persistently on disk

The frontend never talks to OpenAI directly. It only talks to our Express server, which keeps the API key secure on the backend.

### Q: How does AI generation work?
1. Student fills in their profile — saved to SQLite
2. Student picks a target role and clicks Generate
3. Frontend calls `POST /api/ai/generate-resume`
4. Backend loads all profile data from the database
5. Builds a structured prompt: *"Here is the student's data, create a resume for [role]"*
6. Sends to OpenAI API — receives structured JSON back
7. Saves generated resume to database
8. Returns it to frontend for preview

### Q: What is Demo Mode?
When no AI API key is configured, the backend generates the resume directly from stored data without calling any external API. The output is still a complete, properly structured resume — it just uses the student's exact words rather than AI-rephrased language.

### Q: How does PDF download work?
`html2canvas` captures the A4 resume preview as a canvas image. `jsPDF` converts that canvas into a PDF file. The entire process happens in the browser — no server involvement needed.

### Q: How is data stored?
SQLite — a file-based database that needs no separate database server. The entire database is a single `.db` file. All profile data persists across app restarts because it is written to disk after every change.

### Q: What happens to the API key in production?
The API key is stored only in the server's environment variables (`.env` file or platform dashboard). It never appears in frontend JavaScript bundles, never in API responses, and never in logs.

---

## License

MIT — Free to use for educational purposes.
