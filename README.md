# CP OS — Competitive Programming OS

> The all-in-one operating system for competitive programmers.

![CP OS](https://img.shields.io/badge/version-1.0.0-7C3AED?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## 🚀 Features (v1.0)

- **Dashboard** — Good Morning greeting, live CF stats (rating, rank, solved count, max rating)
- **Codeforces Integration** — Official API with Redis caching (15 min TTL)
- **Contest Center** — Upcoming contests from CF, LeetCode, AtCoder with live countdowns
- **Daily Planner** — 4-block study schedule (Morning/Afternoon/Evening/Night) based on CF rating
- **Analytics** — Rating history chart, activity heatmap, problem distribution, topic radar
- **Profile** — Edit CF handle, LeetCode/GitHub usernames, bio, country, institute
- **Discord Notifications** — Webhook-based contest reminders
- **Auth** — Google & GitHub OAuth via Auth.js (completely free)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| UI | Framer Motion, Recharts, Custom Glass Design System |
| Auth | Auth.js v5 (Google + GitHub OAuth) |
| Backend | FastAPI, Python 3.12, SQLAlchemy (async) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | Gemini 1.5 Flash (free tier) |

## 📦 Project Structure

```
cp-os/
├── frontend/          # Next.js 16 app
├── backend/           # FastAPI Python API
├── database/          # PostgreSQL schema
├── docker/            # Docker Compose (local dev)
└── docs/              # Documentation
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker (for local PostgreSQL + Redis)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/cp-os.git
cd cp-os
```

### 2. Start Databases (Docker)

```bash
cd docker
docker-compose up -d
```

This starts:
- PostgreSQL on `:5432`
- Redis on `:6379`
- Adminer (DB GUI) on `:8080`

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
# Fill in GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, NEXTAUTH_SECRET
npm install
npm run dev
```

Open http://localhost:3000

### 4. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Copy .env.example to .env and fill in values
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### 5. Auth Setup

**Google OAuth:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → OAuth 2.0
3. Add `http://localhost:3000/api/auth/callback/google` as redirect URI
4. Copy Client ID + Secret to `.env.local`

**GitHub OAuth:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. New OAuth App → Homepage: `http://localhost:3000`
3. Callback: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID + Secret to `.env.local`

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 🎨 Design

Dark glassmorphic design inspired by **Linear, Vercel, Raycast, and GitHub**.

- **Colors**: Purple `#7C3AED` → Blue `#3B82F6` gradient
- **Font**: Inter (Google Fonts) + JetBrains Mono for code
- **Effects**: Glassmorphism, gradient borders, glow, shimmer loading skeletons

## 🗺️ Roadmap

| Version | Features |
|---------|----------|
| ✅ v1.0 | Auth, Dashboard, Codeforces, Contests, Planner, Analytics, Discord |
| v2.0 | LeetCode integration, Streaks, Gamification, Notes |
| v3.0 | AI Coach (Gemini), Code Review, Weak Topic Detection |
| v4.0 | Friends, Leaderboards, Real-time updates |
| v5.0 | Mobile app, Browser extension |

## 📄 License

MIT — built for the competitive programming community.
