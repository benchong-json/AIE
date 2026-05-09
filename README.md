# Personal Recruiter App (AIE)

This is the app implementation for the personal recruiter agent system described in `../job-skills-general/APP_BUILD.md`.

The MVP focuses on a manual application case workflow:

1. Load or create a Candidate Profile.
2. Paste a job posting.
3. Create an Application Case.
4. (When enabled) Generate an Application Strategy Brief.
5. Draft useful artifacts.
6. Track the case manually (pipeline + follow-ups).
7. Run a case retrospective.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma
- SQLite (local)

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
```

Apply migrations (local SQLite):

```bash
sqlite3 prisma/dev.db ".read prisma/migrations/20260509000000_init/migration.sql"
sqlite3 prisma/dev.db ".read prisma/migrations/20260509000001_case_timeline/migration.sql"
sqlite3 prisma/dev.db ".read prisma/migrations/20260509000002_research_sources/migration.sql"
```

## Run

```bash
npm run dev -- --port 3000 --hostname 127.0.0.1
```

Then open `http://127.0.0.1:3000`.

## Keys

- **Exa** (Sprint 5): set `EXA_API_KEY` in `.env` to enable company research.

## Key routes

- `/profile`: Candidate profile
- `/opportunities`: Manual opportunity intake
- `/cases`: Case workspaces
- `/pipeline`: Pipeline tracker
- `/cases/[id]/artifacts`: Artifact drafts + versions
- `/cases/[id]/retrospective`: Case learning loop
- `/cases/[id]/research`: Exa company research + sources
