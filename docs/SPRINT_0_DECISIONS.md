# Sprint 0 Decisions

## App Foundation

- Framework: Next.js with App Router.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Package manager: npm.

## Local Database

- ORM: Prisma.
- Local provider: SQLite.
- Local database URL: `file:./dev.db`.

SQLite is used for Sprint 0 because it lets the app run locally without cloud credentials. The schema is intentionally simple and can be migrated to Supabase or Neon Postgres when deployment and collaboration become priorities.

## External Services

- OpenAI is planned for Sprint 4 strategy generation.
- Exa is planned for Sprint 5 company and hiring-map research.
- Gmail, Calendar, and recurring sourcing are post-MVP dependencies.

## App Routes

- `/`: build status and workflow overview.
- `/profile`: Candidate Profile workspace placeholder.
- `/opportunities`: manual opportunity intake placeholder.
- `/cases`: Application Case workspace placeholder.
- `/settings`: provider status placeholder.

## Sprint 0 Completion Notes

Sprint 0 is considered complete when the app runs locally, Prisma can generate a client, the initial database schema is applied, and the basic routes render.

Note: Prisma Client generation works in this local environment, but `prisma migrate dev` currently fails inside Prisma's native schema engine without a detailed error. Sprint 0 uses an explicit SQL migration applied through `sqlite3` so the database can still be created and queried locally.
