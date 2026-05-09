# Sprint 2: Manual Opportunity Intake

## What This Sprint Adds

Sprint 2 turns the Opportunities page into a working manual job-posting intake workflow.

## Implemented

- Server-rendered `/opportunities` page.
- Manual opportunity creation form.
- Opportunity list view.
- Opportunity status update form.
- Basic duplicate detection based on company, role title, and source URL.
- Association with the active candidate when a Candidate Profile exists.
- Success and error banners for create/update flows.

## Captured Fields

- Company.
- Role title.
- Job URL.
- Location.
- Work model.
- Source.
- Job description.
- Status.

## Statuses

- `new`
- `shortlisted`
- `skipped`
- `converted-to-case`

## Data Model

Sprint 2 uses the Sprint 0 `Opportunity` table.

## Verification

- `/opportunities` renders.
- `npm run lint` passes.
- `npm run build` passes outside the sandbox.

## Next Step

Sprint 3 should convert a selected Opportunity into an Application Case.
