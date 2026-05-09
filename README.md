# Personal Recruiter App (AIE)

Next.js app for managing a candidate profile, opportunities, application cases, pipeline, artifacts, retrospectives, and Exa-backed company research.

## Local setup

```bash
npm install
cp .env.example .env
```

Required for Sprint 5 company research:
- `EXA_API_KEY`

## Run

```bash
npm run dev -- --port 3000 --hostname 127.0.0.1
```

Then open `http://127.0.0.1:3000`.

## Key routes

- `/profile`: Candidate profile
- `/opportunities`: Manual opportunity intake
- `/cases`: Case workspaces
- `/pipeline`: Pipeline tracker
- `/cases/[id]/artifacts`: Artifact drafts + versions
- `/cases/[id]/retrospective`: Case learning loop
- `/cases/[id]/research`: Exa company research + sources
