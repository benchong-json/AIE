# Sprint 1: Candidate Profile

## What This Sprint Adds

Sprint 1 turns the Candidate Profile from a placeholder into a working data-backed page.

## Implemented

- Server-rendered `/profile` page.
- Active Candidate Profile lookup through Prisma.
- Candidate and profile save action.
- Benedict profile seed / refresh action.
- Profile completeness indicator.
- Editable fields for:
  - Candidate name and email.
  - Profile title.
  - Current role.
  - Location.
  - Target roles.
  - Constraints.
  - Career narrative.
  - Evidence bank.
  - Voice profile.
  - Overclaim boundaries.
  - Raw Markdown profile.

## Data Model

Sprint 1 uses the Sprint 0 schema:

- `Candidate`
- `CandidateProfile`

The evidence bank is stored as a text profile section for the MVP. A separate `EvidenceItem` table can be added later if filtering, tagging, confidence scoring, or role-family mapping becomes important.

## Product Behavior

- If no active profile exists, the page prompts the user to seed Benedict's profile.
- Saving the form creates or updates the candidate and active profile.
- Seeding Benedict refreshes the existing Benedict profile if one already exists.
- Only one profile per candidate is active after save/seed.

## Verification

- `npm run lint` passes.
- `npm run build` passes outside the sandbox.
- Prisma can query `Candidate` and `CandidateProfile` counts.
