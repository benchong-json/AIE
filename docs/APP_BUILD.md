# Personal Recruiter Agent App: Build README

## Product Thesis

This app is a personal opportunity intelligence and job application operating system.

It helps a candidate identify, prioritize, pursue, and manage high-quality job opportunities by continuously sourcing relevant roles and company signals, evaluating role fit and access paths, generating tailored application strategies and materials, tracking pipeline activity, and learning from each application outcome to improve future recommendations.

The app should behave less like a job-board scraper and more like an experienced personal recruiter: selective, commercially sharp, evidence-led, network-aware, and focused on helping the candidate spend effort only where the expected return is high.

## Core User

The initial user is a mid-career strategy, BizOps, GTM, operator, founder's office, or AI-operations candidate who wants a more tailored and efficient job search.

The system should eventually support any candidate by first creating an active Candidate Profile. Candidate-specific truth belongs in `profiles/`; reusable reasoning behavior belongs in `skills/`; case-specific learnings belong in `learnings/`.

## App Objectives

The app should help the candidate:

- Clarify target roles, target companies, constraints, and positioning.
- Discover relevant job opportunities and company signals on a recurring basis.
- Score and rank opportunities based on fit, upside, risk, and access quality.
- Decide whether to apply, seek a referral, contact a hiring manager, monitor, or skip.
- Build a tailored application case for each selected opportunity.
- Generate high-signal application materials and outreach drafts.
- Track applications, conversations, follow-ups, interviews, and next actions.
- Monitor email, LinkedIn, and other channels for company or recruiter signals.
- Learn from each case and outcome to improve future sourcing, scoring, positioning, and artifacts.

## What The App Is Not

The app should not optimize for application volume.

It should not blindly apply to every plausible job. It should not create generic resumes, cover letters, or outreach. It should not claim experience that is not supported by the active Candidate Profile. It should not contact people, send messages, submit applications, or use sensitive claims without user approval.

## Experienced Recruiter JTBD

An experienced personal recruiter performs five jobs:

1. **Clarify the candidate's market**
   Define what roles, levels, companies, industries, geographies, and narratives are actually worth pursuing.

2. **Source opportunity intelligence**
   Monitor job postings, saved jobs, company growth signals, leadership changes, funding events, hiring spikes, and warm-network paths.

3. **Triage opportunities**
   Separate high-priority opportunities from referral-only, monitor, and skip opportunities.

4. **Shape the application path**
   Decide whether the candidate should cold apply, seek a referral, approach a hiring manager, speak with a sponsor, prepare a standout artifact, or skip.

5. **Manage pipeline and momentum**
   Track applications, conversations, follow-ups, recruiter responses, interviews, rejections, and next steps.

The app should encode these jobs directly into product workflows.

## Core Workflow

### 1. Candidate Profile Setup

The user creates or uploads a Candidate Profile.

Inputs may include:

- Resume.
- LinkedIn profile.
- Work history.
- Target roles.
- Target industries.
- Location and relocation preferences.
- Compensation constraints.
- Work authorization.
- Voice and writing preferences.
- Dealbreakers.
- Prior application examples.

Outputs:

- Candidate Profile.
- Evidence bank.
- Target role strategy.
- Credibility risks.
- Overclaim boundaries.
- Voice profile.

Relevant skill:

- `user-profile-and-positioning-intake`

### 2. Opportunity Intelligence

The agent runs a recurring search for opportunities.

Inputs:

- Saved jobs.
- LinkedIn jobs.
- Company career pages.
- Applicant tracking system pages.
- Investor portfolio job boards.
- Other reputable job sites.
- User-defined target roles, industries, geographies, seniority, company stage, and exclusions.
- Optional company-watchlist signals.

Outputs:

- Opportunity digest.
- Job-posting database.
- Company signal database.
- Recommended opportunities.
- Skips with reasons.

Success criteria:

- Runs autonomously on a defined cadence.
- Searches across predefined sources.
- Deduplicates roles.
- Highlights newly added, changed, reposted, or closed roles.
- Recommends roles based on candidate-specific fit, not keyword matching alone.
- Bonus: discovers high-signal opportunities from reputable sources outside the predefined list.

### 3. Digest and Triage

The app produces a ranked digest of relevant opportunities.

Each opportunity should include:

- Role title.
- Company.
- Location and work model.
- Source.
- Posting date or freshness signal.
- Fit score.
- Upside score.
- Risk score.
- Access score.
- Why it matches.
- Why it may not fit.
- Recommended action.

Recommended actions:

- Apply now.
- Apply with tailored strategy.
- Referral before applying.
- Sponsor conversation before applying.
- Hiring manager outreach.
- Recruiter outreach.
- Monitor.
- Skip.

The digest should make it easy for the user to select the opportunities worth deeper work.

### 4. Application Case Creation

When the user selects an opportunity, the app creates an Application Case.

The case becomes the workspace for:

- Job description.
- Company research.
- Hiring-map research.
- Role deconstruction.
- Candidate positioning.
- Access strategy.
- Referral strategy.
- Application materials.
- Interview prep.
- Follow-up plan.
- Case retrospective.

Relevant skills:

- `target-company-problem-discovery`
- `experience-evidence-mining`
- `gtm-ai-resume-positioning`
- `strategic-referral-packet`
- `sponsor-conversation-prep`
- `application-retrospective-and-skill-update`

### 5. Application Strategy

For each Application Case, the agent recommends how to maximize the candidate's odds.

The strategy should include:

- Whether the role is worth pursuing.
- Best application path.
- Best positioning thesis.
- Documents needed.
- Referral paths.
- Hiring manager or senior leader targets.
- Recruiter targets.
- Outreach sequence.
- Whether a standout artifact is useful.
- Risks and objections to manage.

Access strategy should be scored separately from role fit. A strong-fit role with no access may be lower priority than a slightly weaker-fit role with a strong sponsor path.

### 6. Artifact Generation

If the user proceeds, the agent generates case-specific artifacts.

Possible artifacts:

- Tailored resume.
- Resume rewrite brief.
- Referral packet.
- Sponsor message.
- Forwardable candidate blurb.
- Recruiter message.
- Hiring manager outreach.
- Cover letter, only when useful.
- Interview talk tracks.
- Smart questions.
- Follow-up messages.
- Standout artifact, only when high signal.

The agent should provide ready-to-use drafts, but user approval is required before sending anything or submitting an application.

### 7. Application Tracking

The app tracks the full application lifecycle.

Tracked fields:

- Company.
- Role.
- Source.
- Date discovered.
- Date selected.
- Date applied.
- Status.
- Contacts.
- Outreach sent.
- Referral status.
- Interviews.
- Follow-up deadlines.
- Signals detected.
- Next recommended action.
- Outcome.
- Outcome reason, if known.

Statuses:

- Discovered.
- Shortlisted.
- Researching.
- Preparing materials.
- Awaiting referral.
- Applied.
- Recruiter screen.
- Interviewing.
- Take-home or case.
- Offer.
- Rejected.
- Withdrawn.
- Dormant.
- Archived.

### 8. Signal Monitoring

The app monitors user-authorized channels for relevant signals.

Potential sources:

- Gmail.
- LinkedIn.
- Calendar.
- Applicant tracking emails.
- Recruiter emails.
- Company newsletters or alerts.
- Saved job changes.

Signal examples:

- Recruiter replies.
- Interview invite.
- Rejection.
- Referral confirmation.
- Hiring manager response.
- Job reposted.
- Job closed.
- Company opens related role.
- Contact views or engages with profile, if available.
- Interview scheduled.

Signals should trigger alerts and recommended next actions.

Examples:

- Recruiter replied: draft response and update status.
- Interview scheduled: trigger interview prep.
- Referral sent: remind user to follow up after a defined period.
- Rejection received: update case outcome and run retrospective.
- No response after application: suggest hiring manager or recruiter outreach.
- Role reposted: recommend whether to re-engage.

### 9. Learning Loop

After each meaningful case or outcome, the app runs a retrospective.

The retrospective should capture:

- What worked.
- What failed.
- Which positioning landed.
- Which artifacts were useful.
- Which sources produced strong opportunities.
- Which fit scores were false positives.
- Which outreach paths worked.
- Which claims felt weak or unsupported.
- Which skill instructions should be updated.

Learning destinations:

- Candidate Profile.
- General skills.
- Templates.
- Source scoring logic.
- Role preference model.
- Changelog.
- Case-learning note.

The app should avoid prompt drift. Individual case facts should stay in case notes unless a lesson is reviewed and generalized.

## Key Product Modules

### Candidate Profile

Source of truth for candidate-specific context.

Includes:

- Career narrative.
- Target roles.
- Evidence bank.
- Signature strengths.
- Constraints.
- Voice.
- Credibility risks.
- Overclaim boundaries.

### Opportunity Intelligence Engine

Finds and normalizes job postings and company signals.

Responsibilities:

- Search.
- Scrape where permitted.
- Ingest saved jobs.
- Deduplicate.
- Detect changes.
- Enrich company metadata.
- Score freshness.
- Store source provenance.

### Match and Triage Engine

Ranks opportunities against the active Candidate Profile.

Scores:

- Fit score.
- Upside score.
- Risk score.
- Access score.
- Urgency score.
- Effort-to-signal score.

### Application Case Workspace

The main workspace for a selected opportunity.

Contains:

- Research.
- Role deconstruction.
- Positioning.
- Strategy.
- Artifacts.
- Contacts.
- Timeline.
- Status.
- Retrospective.

### Application Artifact Generator

Uses the skill layer to generate tailored documents and messages.

Should produce:

- Drafts.
- Rationale.
- Risks.
- Version history.
- Approval state.

### Network and Access Mapper

Identifies possible paths into the company.

Potential sources:

- LinkedIn connections.
- Alumni networks.
- Former colleagues.
- Investors and advisors.
- Mutual connections.
- Recruiters.
- Hiring managers.
- Functional leaders.

Outputs:

- Referral paths.
- Contact priority.
- Outreach drafts.
- Follow-up sequence.

### Pipeline Tracker

Tracks application status and next actions.

Should surface:

- Active opportunities.
- Stale applications.
- Follow-up reminders.
- Upcoming interviews.
- Waiting-on states.
- Outcomes.

### Signal Monitor

Scans authorized channels for relevant signals and triggers next steps.

### Learning System

Updates profiles, preferences, templates, skills, and scoring based on observed outcomes.

## Key Artifacts

### Candidate Profile

Persistent profile used across all workflows.

### Opportunity Digest

Recurring ranked summary of recommended roles and companies.

### Opportunity Record

Normalized job posting and company-signal object.

### Application Case

The full workspace for one selected opportunity.

### Application Strategy Brief

Role fit, problem thesis, access plan, positioning, documents needed, and next action.

### Referral Packet

Sponsor note, forwardable blurb, resume angle, and optional strategic note.

### Tailored Resume

Role-specific resume or resume rewrite plan.

### Outreach Sequence

Sponsor, recruiter, hiring manager, and follow-up drafts.

### Interview Prep Pack

Opening pitch, why company, why role, story bank, objections, questions.

### Application Tracker

Pipeline view across all active cases.

### Case Learning Note

Post-case retrospective that captures lessons and proposed updates.

### Skill Changelog

Traceable record of system changes.

## Suggested Data Objects

### Candidate

- id
- name
- profile
- target_roles
- constraints
- evidence_bank
- voice_profile
- overclaim_boundaries

### Opportunity

- id
- company
- role_title
- job_description
- source_url
- source_type
- location
- work_model
- seniority
- function
- date_posted
- date_seen
- freshness_status
- normalized_requirements
- company_metadata

### Match Assessment

- opportunity_id
- candidate_id
- fit_score
- upside_score
- risk_score
- access_score
- urgency_score
- recommended_action
- rationale

### Application Case

- id
- candidate_id
- opportunity_id
- status
- thesis
- strategy
- artifacts
- contacts
- timeline
- next_actions
- outcome
- retrospective

### Contact

- id
- company
- name
- role
- relationship_type
- source
- priority
- outreach_status

### Signal

- id
- source
- candidate_id
- application_case_id
- signal_type
- timestamp
- content_summary
- confidence
- recommended_action

### Artifact

- id
- application_case_id
- artifact_type
- content
- status
- version
- created_at
- approved_at

## Autonomy and Approval Rules

The app may run autonomously for:

- Searching sources.
- Deduplicating jobs.
- Scoring opportunities.
- Producing digests.
- Creating draft research.
- Creating draft application strategies.
- Drafting documents and messages.
- Monitoring authorized channels.
- Suggesting next actions.
- Running retrospectives.

The app must require user approval before:

- Sending messages.
- Submitting applications.
- Editing live LinkedIn or public profiles.
- Contacting people.
- Using sensitive or uncertain claims.
- Uploading documents to third-party sites.
- Storing new credentials or connecting new accounts.

## MVP Scope

### MVP 1: Manual-Input Application Workspace

Goal: Validate application case quality.

Features:

- Candidate Profile.
- User pastes job posting.
- App runs company/problem discovery.
- App creates application strategy.
- App generates tailored resume brief, sponsor message, and recruiter note.
- App creates Application Case.
- App tracks status manually.
- App runs retrospective.

### MVP 2: Recurring Digest

Goal: Validate sourcing and prioritization.

Features:

- Saved search criteria.
- Ingest from predefined job sources.
- Deduplicate postings.
- Score jobs.
- Produce weekly or twice-weekly digest.
- User can select opportunities to create cases.

### MVP 3: Pipeline and Signal Tracking

Goal: Manage momentum.

Features:

- Application tracker.
- Gmail integration.
- Calendar integration.
- Basic signal detection.
- Follow-up reminders.
- Interview prep trigger.
- Rejection trigger and retrospective.

### MVP 4: Network and Access Mapping

Goal: Improve conversion.

Features:

- LinkedIn or contact import, subject to available APIs and permissions.
- First-degree and second-degree path suggestions.
- Contact prioritization.
- Outreach drafts.
- Referral tracking.

### MVP 5: Dashboard

Goal: Make the system usable as an operating cockpit.

Views:

- Digest.
- Active cases.
- Application pipeline.
- Next actions.
- Interviews.
- Follow-ups.
- Outcomes and learning.

## Dashboard Views

### Home

- Top recommended opportunities.
- Urgent next actions.
- Upcoming interviews.
- Stale applications.
- New signals.

### Digest

- Ranked jobs.
- Filters.
- Fit rationale.
- Recommended action.
- Create case button.

### Case Workspace

- Role and company.
- Research.
- Strategy.
- Artifacts.
- Contacts.
- Timeline.
- Signals.
- Retrospective.

### Pipeline

- Kanban or table by status.
- Follow-up dates.
- Contacts.
- Current blockers.
- Next action.

### Profile

- Candidate Profile.
- Evidence bank.
- Voice profile.
- Constraints.
- Target roles.

### Learning

- Case learnings.
- Outcome analytics.
- Proposed skill updates.
- Changelog.

## Success Metrics

### Sourcing Quality

- Number of high-fit opportunities found per week.
- Percentage of digest jobs the user marks relevant.
- False-positive rate.
- Duplicate rate.
- Freshness of postings.

### Application Quality

- User acceptance rate of generated strategies.
- User acceptance rate of generated messages.
- Time from selected role to ready-to-apply package.
- Number of cases with clear access strategy.

### Conversion

- Application-to-response rate.
- Referral request-to-referral rate.
- Recruiter screen rate.
- Interview rate.
- Offer rate.
- Quality-adjusted offer rate.

### Pipeline Health

- Number of active applications.
- Number of stale applications.
- Follow-up completion rate.
- Average time in each status.

### Learning Quality

- Number of useful case learnings captured.
- Number of accepted skill/profile updates.
- Reduction in false positives over time.
- Improvement in response rate by source, role type, and strategy.

## Integrations

Potential integrations:

- Gmail for recruiter and application emails.
- Google Calendar for interviews and follow-up reminders.
- LinkedIn for saved jobs, connections, and profile context, subject to platform limits.
- Job boards and ATS pages.
- Company career pages.
- Investor portfolio job boards.
- Notion, Google Sheets, Airtable, or a native database for tracking.
- Resume export to PDF or DOCX.

Integration principle:

Start with sources that are reliable, permissioned, and easy to audit. Add scraping only where allowed and where source quality justifies the maintenance cost.

## Recommended Tech Stack and Tool Dependencies

The app should be built as a modular agentic product, not as one monolithic scraper. Separate the product surface, data layer, agent orchestration, source connectors, and approval gates.

### Recommended Default Stack

For a practical MVP:

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Fast path to a dashboard, case workspace, forms, and authenticated app shell. |
| Backend | Next.js API routes or a separate Node/TypeScript service | Keeps product and agent workflows close during MVP. Split later if workflows become heavy. |
| Database | Postgres via Supabase or Neon | Good default for candidate profiles, opportunities, cases, artifacts, signals, and status history. |
| ORM | Prisma or Drizzle | Typed schema management and migrations. |
| Auth | Clerk, Auth.js, or Supabase Auth | Needed for personal data, connected accounts, and approval gates. |
| File storage | Supabase Storage, S3, or Cloudflare R2 | Store resumes, generated PDFs/DOCX, exported profiles, and case artifacts. |
| Background jobs | Inngest, Trigger.dev, Temporal, or BullMQ plus Redis | Required for scheduled job search, digest generation, source refreshes, email scanning, and retrospectives. |
| Queue/cache | Redis via Upstash or managed Redis | Useful for rate limits, crawl jobs, dedupe keys, and temporary agent state. |
| Observability | Sentry plus structured logs | Needed because autonomous sourcing and signal monitoring will fail quietly without traces. |
| Analytics | PostHog or lightweight event tables | Track digest relevance, application conversion, source quality, and outcome learning. |

### Agent and LLM Layer

Recommended:

- OpenAI Responses API for core reasoning, structured outputs, tool calling, file search, and agentic workflows.
- OpenAI Agents SDK if the app needs multi-agent handoffs, traces, tool orchestration, or specialized agents such as sourcing agent, research agent, resume agent, and retrospective agent.
- Structured JSON outputs for opportunity scoring, application strategy, case records, and signal classification.
- RAG over the Candidate Profile, prior cases, case learnings, artifacts, and skill files.

Agent design:

- **Sourcing agent**: searches and normalizes opportunities.
- **Triage agent**: scores fit, upside, risk, access, and urgency.
- **Research agent**: runs company and hiring-map research.
- **Application strategist**: creates positioning and application path.
- **Artifact agent**: drafts resumes, referral notes, outreach, and interview prep.
- **Signal agent**: classifies emails, calendar events, and recruiter/company signals.
- **Retrospective agent**: updates case learnings and proposes skill/profile updates.

Use direct APIs for production-critical data ingestion where possible. Use MCP as an agent tool interface where it improves portability, but do not make MCP the only source of truth for core data unless the connector is stable, permissioned, and auditable.

### Search and Research Dependencies

Recommended:

- **Exa**: primary AI-native web search and research layer for company research, hiring-map discovery, people/company enrichment, recent news, source discovery, and structured search outputs. Exa is especially relevant because it supports search, contents extraction, company and people categories, structured outputs, and MCP options.
- OpenAI web search / file search: useful inside agent workflows, especially when paired with the Candidate Profile and internal case artifacts.
- SerpAPI, Tavily, or Brave Search API: optional fallback search providers for SERP-style coverage, source diversity, and redundancy.
- Firecrawl, Browserbase, or Playwright: optional page extraction and browser automation for career pages, ATS pages, and job-board pages where allowed.

Recommended approach:

1. Use direct ATS and company career page URLs when available.
2. Use Exa for broad discovery, company research, people research, and source enrichment.
3. Use a fallback search API for query coverage and redundancy.
4. Use browser automation only for permitted sources and only when APIs or clean feeds are unavailable.
5. Store source URLs, timestamps, extracted text, and confidence scores for every external claim.

### Job Source Connectors

MVP sources:

- User-pasted job descriptions.
- User-uploaded saved jobs export or spreadsheet.
- Company career pages.
- Greenhouse, Lever, Ashby, Workday, and other ATS-hosted job pages where accessible.
- Investor portfolio job boards.
- Email job alerts forwarded to Gmail.

Later sources:

- LinkedIn saved jobs or alerts through user-authorized, compliant workflows.
- Wellfound, Otta/Welcome to the Jungle, Indeed, Google Jobs, VC portfolio boards, and niche industry boards.
- Company watchlists based on funding, hiring spikes, leadership changes, and relevant open roles.

Important LinkedIn note:

LinkedIn should not be treated as a normal open data source. Official LinkedIn Talent APIs are restricted, partner-based, and not broadly self-serve. LinkedIn's Job Posting API is for authorized partners posting jobs, not for an individual job seeker sourcing saved jobs. Build the MVP so LinkedIn can be supported through user-provided saved-job exports, email alerts, manual links, browser-assisted capture, or an approved partner integration if access is obtained. Avoid making unofficial LinkedIn scraping or unofficial LinkedIn MCP servers a core dependency.

### MCP Strategy

MCP is useful as a tool-connection layer for agents, especially during development.

Recommended MCP use:

- Exa MCP for research/search workflows, if preferred over direct SDK integration.
- Gmail or Google Workspace MCP for prototyping email/calendar signal workflows, if available in the chosen environment.
- Browser automation MCP for controlled research and page extraction.
- Internal MCP server exposing app-specific tools such as `create_case`, `score_opportunity`, `update_pipeline_status`, `draft_referral_packet`, and `record_case_learning`.

Production guidance:

- Prefer direct OAuth/API integrations for production-critical Gmail, Calendar, database, and app actions.
- Use MCP for agent portability and tool abstraction.
- Require allowlists, audit logs, and user approval for any MCP tool that writes data, sends messages, edits documents, or accesses sensitive accounts.
- Treat third-party MCP servers as supply-chain dependencies that need review, permissions scoping, and monitoring.

### Email, Calendar, and Signal Monitoring

Recommended:

- Gmail API for recruiter emails, job alerts, application confirmations, rejections, and interview scheduling signals.
- Google Calendar API for interview detection and prep triggers.
- OAuth scopes should be minimized. Prefer read-only scopes for monitoring unless write access is explicitly needed.
- Classify signals into structured types: recruiter reply, rejection, referral confirmation, interview invite, follow-up due, role closed, role reposted, and next-action reminder.

Approval principle:

The app may draft replies and next actions automatically, but it should not send emails, calendar invites, LinkedIn messages, or applications without user approval.

### Document and Resume Generation

Recommended:

- Markdown as the canonical artifact format.
- DOCX export for resumes and referral packets.
- PDF export for final submissions.
- Version history for each artifact.
- Optional Google Docs integration later for collaborative editing.

Possible libraries:

- `pandoc`, `docx`, or document-template libraries for DOCX/PDF export.
- Server-side rendering or template-based exports for polished resume formats.

### Data and Knowledge Layer

The app should store both structured data and text artifacts.

Recommended:

- Postgres tables for candidates, opportunities, match assessments, cases, contacts, signals, artifacts, and retrospectives.
- Vector search via pgvector, Supabase Vector, or a managed vector DB if retrieval over profiles, cases, and artifacts becomes important.
- Full-text search over job descriptions, company research, and case notes.
- Source provenance on every external claim.

### Compliance and Privacy Dependencies

Required:

- OAuth-based account connections.
- Encrypted storage for tokens.
- Secret manager for API keys.
- Audit log for agent actions.
- User approval records for outbound actions.
- Data deletion/export controls.
- Clear separation between candidate-private data and reusable generalized skill learnings.

### Stack Recommendation by Phase

#### MVP 1: Manual Case Workspace

Use:

- Next.js + TypeScript.
- Postgres via Supabase or Neon.
- Prisma or Drizzle.
- OpenAI Responses API.
- Exa API.
- Markdown artifacts.
- Manual job input.

Avoid initially:

- LinkedIn automation.
- Complex scraping.
- Automated outbound messages.
- Heavy multi-agent orchestration.

#### MVP 2: Recurring Digest

Add:

- Background jobs via Inngest, Trigger.dev, Temporal, or BullMQ.
- Exa scheduled searches.
- ATS/career-page connectors.
- Dedupe and freshness detection.
- Digest email or in-app digest.

#### MVP 3: Tracking and Signals

Add:

- Gmail API.
- Google Calendar API.
- Signal classifier.
- Follow-up reminders.
- Application pipeline dashboard.

#### MVP 4: Network and Access

Add:

- Contact import.
- LinkedIn manual link capture or approved integration path.
- People/company enrichment via Exa and user-authorized sources.
- Referral path scoring.

#### MVP 5: Production Agent Platform

Add:

- OpenAI Agents SDK or equivalent orchestration layer.
- Internal MCP server for app actions.
- Tool permissioning.
- Tracing and evals.
- Outcome-learning analytics.

## Risks and Design Constraints

### Platform Access Risk

LinkedIn and many job boards restrict scraping and automation. The app should prefer official APIs, user-provided exports, saved-job imports, browser-assisted workflows, or compliant scraping where allowed.

### Privacy Risk

The app may process sensitive career, email, compensation, and network data. It should be explicit about storage, permissions, retention, and user control.

### Over-Automation Risk

Applying or contacting people automatically can damage trust. Keep user approval gates for external actions.

### Generic Output Risk

The app must preserve candidate voice and evidence. Generic AI application materials are worse than no tailoring.

### Overfitting Risk

Individual application lessons should not automatically alter general skills. Use case retrospectives and changelog review.

### Research Freshness Risk

Company and hiring data change quickly. Any external company claim used in application materials should be refreshed before final use.

## Build Principles

- Profile first: no serious application work without candidate context.
- Evidence first: do not invent or inflate candidate claims.
- Problem-led: infer company and hiring-manager needs, not just keyword-match job descriptions.
- Access-aware: evaluate referral and network paths alongside role fit.
- Action-oriented: every digest item and case should have a recommended next step.
- Human-approved: drafts and recommendations can be autonomous; external actions require approval.
- Learning-oriented: every case should improve the candidate profile, sourcing logic, or reusable skill layer.
- Traceable: store sources, rationale, artifacts, case learnings, and changelog entries.

## Current Skill Foundation

Existing reusable skills:

- `user-profile-and-positioning-intake`
- `target-company-problem-discovery`
- `experience-evidence-mining`
- `gtm-ai-resume-positioning`
- `strategic-referral-packet`
- `sponsor-conversation-prep`
- `application-retrospective-and-skill-update`

Current supporting artifacts:

- `profiles/profile-template.md`
- `profiles/benedict-chong.md`
- `learnings/case-learning-template.md`
- `learnings/siro-case-learning.md`
- `changelog.md`

## Near-Term Build Recommendation

Start with a local or lightweight web app that supports:

1. Candidate Profile creation.
2. Manual job posting ingestion.
3. Opportunity scoring.
4. Application Case creation.
5. Application strategy generation.
6. Artifact drafting.
7. Manual pipeline tracking.
8. Case retrospective.

Once case quality is strong, add autonomous sourcing and signal monitoring. The intelligence layer should be correct before the automation layer becomes broad.

