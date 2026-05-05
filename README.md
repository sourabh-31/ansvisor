# Ansvisor

Open source AI Engine Optimization (AEO) platform. Monitor your brand's visibility across AI search engines, track competitors, and get content optimization suggestions.

## Features

- **AI Search Tracking** — Monitor how AI engines (ChatGPT, Gemini, Perplexity, Grok, Claude) mention your brand
- **Brand Visibility Analytics** — Real-time dashboard with visibility scores and trend analysis
- **Competitor Tracking** — Compare your AI presence against competitors
- **Content Optimization** — AI-powered suggestions to improve your brand's representation
- **Prompt Volume Analysis** — Understand search demand across AI platforms
- **Multi-language Support** — 13 languages, 18 regions
- **Self-hosted or Cloud** — Run on your own infrastructure with all features unlocked

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Yarn](https://yarnpkg.com/) (for the web app)
- A [Supabase](https://supabase.com/) project (free tier works)

### Required Services

| Service | Purpose | Where to get |
|---------|---------|--------------|
| **Supabase** | Database, Auth, API | [supabase.com](https://supabase.com/) |
| **AI Provider** (at least one) | Brand tracking across AI engines | [OpenAI](https://platform.openai.com/) / [Google Gemini](https://ai.google.dev/) / [Anthropic](https://console.anthropic.com/) |
| **Cloro** | Web scraping for AI platform responses | [cloro.ai](https://cloro.ai/) |

### Optional Services

| Service | Purpose | Where to get |
|---------|---------|--------------|
| **DataForSEO** | Keyword volume data for prompt analysis | [dataforseo.com](https://dataforseo.com/) |
| **Stripe** | Payments (cloud mode only, not needed for self-hosted) | [stripe.com](https://stripe.com/) |

### Setup

#### 1. Clone and configure

```bash
git clone https://github.com/aeohub/ansvisor.git
cd ansvisor

cp web/.env.example web/.env.local
cp server/.env.example server/.env
```

Edit both `.env` files and fill in your credentials. See the comments in each file for guidance.

#### 2. Set up the database

Run the migration SQL to create all tables, indexes, RLS policies, and triggers:

**Option A — Supabase Dashboard:**
1. Go to your project's **SQL Editor**
2. Paste the contents of `supabase/migrations/00001_initial_schema.sql`
3. Click **Run**

**Option B — Supabase CLI:**

```bash
npx supabase link --project-ref <YOUR_PROJECT_REF>
npx supabase db push
```

#### 3. Install dependencies

```bash
cd web && yarn install && cd ..
cd server && npm install && cd ..
```

#### 4. Start dev servers

```bash
# Terminal 1 — frontend
cd web && yarn dev          # http://localhost:3000

# Terminal 2 — backend
cd server && npm run dev    # http://localhost:80
```

### Docker

```bash
# Configure env files first, then:
docker compose up --build
```

### Self-hosted vs Cloud

Set `IS_CLOUD=false` (default) in `server/.env` and `NEXT_PUBLIC_IS_CLOUD=false` in `web/.env.local` for self-hosted mode. All features are unlocked automatically — no Stripe or payment setup needed.

## Project Structure

```
ansvisor/
├── web/                 # Next.js 16 frontend (TypeScript)
├── server/              # Express backend (Node.js ESM)
├── supabase/            # Database migrations and config
├── scripts/             # Version management tooling
├── docker-compose.yml   # Containerized deployment
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

## Tech Stack

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, Stripe, Zustand, Recharts, next-intl

**Backend** — Express, Vercel AI SDK, multi-provider AI (OpenAI, Anthropic, Google, Perplexity, Grok), Supabase, Socket.IO, Zod

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, branch naming, commit conventions, and PR guidelines.

## License

[MIT](LICENSE) — Copyright (c) 2026 Empler AI Inc.
