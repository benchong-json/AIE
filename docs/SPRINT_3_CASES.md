# Sprint 3: Application Case Workspace

## What Shipped

- Added opportunity-to-case conversion from `/opportunities`.
- Replaced the `/cases` placeholder with a case pipeline list.
- Added `/cases/[id]` as the main workspace for a selected role.
- Added editable case status, next action, follow-up date, outcome, and notes.
- Added persisted timeline events for case creation and case updates.

## Key Files

- `src/app/opportunities/page.tsx`
- `src/app/cases/page.tsx`
- `src/app/cases/[id]/page.tsx`
- `src/app/cases/actions.ts`
- `src/lib/case-statuses.ts`
- `prisma/schema.prisma`
- `prisma/migrations/20260509000001_case_timeline/migration.sql`

## Local Database Update

Sprint 3 adds `CaseTimelineEvent`.

The local SQLite migration was applied with:

```sh
sqlite3 prisma/dev.db ".read prisma/migrations/20260509000001_case_timeline/migration.sql"
```

Prisma Client was regenerated with:

```sh
npx prisma generate
```

## Verification

- Verified the Siro opportunity exists in `prisma/dev.db`.
- Converted the Siro opportunity into an Application Case through the app action.
- Verified the Siro case appears on `/cases` and `/cases/cmoy1oq4l00014dll4pc17stp`.
- `npm run lint` passes.
- `npm run build` passes outside the sandbox.

## User Flow

1. Go to `/opportunities`.
2. Click `Create case` on a saved opportunity.
3. Open the generated case workspace.
4. Update status, notes, next action, follow-up date, and outcome.
5. Save the case and confirm the timeline logs the update.

## Next Sprint

Sprint 4 should add the first agent workflow: generate and persist an Application Strategy Brief from the Candidate Profile and Opportunity.
