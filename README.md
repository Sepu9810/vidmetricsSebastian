# VidMetrics

AI-powered YouTube channel intelligence platform. Analyze any channel in seconds, get performance scores, engagement metrics, and actionable strategy insights for every video.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (serverless database, auth, server functions)
- **AI**: OpenAI GPT for video analysis + strategic insights
- **Data**: Apify for YouTube data extraction
- **Email**: Resend for transactional emails (report notifications, password reset)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account
- API keys for: OpenAI, Apify, Resend

### Installation

```bash
npm install
```

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Convex deployment identifier |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex site URL used by auth callbacks |
| `CONVEX_DEPLOY_KEY` | Convex deploy key for non-local builds |
| `NEXT_PUBLIC_APP_URL` | Public app URL used in the frontend and in reset/report email links |

Set these in your **Convex dashboard** because the actions run on Convex:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Same production URL used by the web app, required for reset/report email links |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis |
| `APIFY_API_TOKEN` | Apify token for YouTube scraping |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | Verified sender for outgoing emails |

Mirror `NEXT_PUBLIC_APP_URL` into Vercel as well so the frontend build and Convex emails use the same canonical URL.

### Development

```bash
# Start the Convex dev server + Next.js
npx convex dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── convex/              # Backend (Convex functions, schema, auth)
│   ├── auth.ts          # Authentication configuration
│   ├── schema.ts        # Database schema
│   ├── reports.ts       # Report queries & mutations
│   ├── analyze.ts       # AI analysis pipeline
│   ├── users.ts         # User queries
│   └── verify.ts        # Email verification
├── public/              # Static assets
│   ├── favicon.png      # App icon
│   └── app-preview.png  # Landing page screenshot
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── (app)/       # Authenticated routes (dashboard, reports)
│   │   ├── login/       # Authentication page
│   │   └── page.tsx     # Landing page
│   ├── components/
│   │   ├── auth/        # Login & auth components
│   │   ├── brand/       # Logo & branding
│   │   ├── layout/      # App shell, navigation
│   │   ├── marketing/   # Landing page
│   │   ├── providers/   # React context providers
│   │   ├── reports/     # Report screens & cards
│   │   ├── shared/      # Reusable UI (StatusPill, etc.)
│   │   └── ui/          # shadcn/ui primitives
│   └── lib/             # Utilities & helpers
```

## Features

- 🔐 Email/password authentication with magic-link password reset
- 📊 AI-powered channel analysis with performance scoring
- 🎯 Per-video AI insights (hooks, patterns, engagement drivers)
- ⚡ Shorts vs Long-form content comparison
- 📧 Email notifications when reports are ready
- 📥 Download reports as standalone HTML files
- 📱 Fully responsive (mobile, tablet, desktop)

## Deployment

Deploy to [Vercel](https://vercel.com) with your GitHub repo connected. Mirror the Convex client variables from development into Vercel, and keep the server-side AI/email secrets in the Convex dashboard.

---

Developed by **Sebastián Sepúlveda**
