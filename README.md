# Placement Portfolio Engine

Convert your resume into a **recruiter-optimized portfolio website** powered by AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FarhanAkhtar4/placement-portfolio-engine)

## Features

- **PDF Resume Upload** — Drag & drop your resume, validated and parsed automatically
- **AI-Powered Processing** — Extracts structured data, rewrites content with action verbs and quantified impact
- **API Status Detection** — Real-time health check with categorized error messages
- **Full Inline Editing** — Edit every field: name, title, about, skills, projects, contact info
- **Edit/Preview Toggle** — See a live preview of your portfolio as you edit
- **One-Click Deploy** — Download a production-ready HTML file, deploy to Vercel, Netlify, or GitHub Pages

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui
- **State**: Zustand
- **AI**: z-ai-web-dev-sdk (LLM for resume analysis)
- **PDF Parsing**: pdf-parse
- **Deployment**: Self-contained HTML output

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- An AI SDK API key (configured via environment)

### Installation

```bash
git clone https://github.com/FarhanAkhtar4/placement-portfolio-engine.git
cd placement-portfolio-engine
bun install
```

### Run Locally

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment — Environment Variables

After deploying with the button above, you **must** configure environment variables for the AI to work.

### Step-by-step

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Key | Value | Environments |
|-----|-------|-------------|
| `Z_AI_BASE_URL` | Your AI service base URL (e.g. `http://172.25.136.193:8080/v1`) | Production + Preview |
| `Z_AI_API_KEY` | Your AI API key | Production + Preview |

4. Click **Save**
5. **Redeploy** your app (Deployments → Redeploy) for changes to take effect

> **Key names are exact** — use `Z_AI_BASE_URL` and `Z_AI_API_KEY` with no spaces or special characters.

## User Flow

1. **Upload** — Drop your PDF resume
2. **Process** — AI extracts and optimizes your data
3. **Edit** — Customize all portfolio sections inline
4. **Deploy** — Download a clean HTML portfolio file

## Deploy

After downloading the generated HTML file:

- **Vercel**: Rename to `index.html`, push to a repo, connect to Vercel
- **Netlify**: Drag and drop at [app.netlify.com/drop](https://app.netlify.com/drop)
- **GitHub Pages**: Push to a repo, enable Pages in Settings

## License

MIT
