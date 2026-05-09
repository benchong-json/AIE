PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CandidateProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "candidateId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "currentRole" TEXT,
  "location" TEXT,
  "targetRoles" TEXT NOT NULL,
  "constraints" TEXT,
  "careerNarrative" TEXT,
  "evidenceBank" TEXT,
  "voiceProfile" TEXT,
  "overclaimBoundaries" TEXT,
  "rawMarkdown" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateProfile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Opportunity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "candidateId" TEXT,
  "company" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "location" TEXT,
  "workModel" TEXT,
  "sourceUrl" TEXT,
  "sourceType" TEXT,
  "jobDescription" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Opportunity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ApplicationCase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "candidateId" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'discovered',
  "thesis" TEXT,
  "notes" TEXT,
  "nextAction" TEXT,
  "followUpAt" DATETIME,
  "outcome" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationCase_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ApplicationCase_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Artifact" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Artifact_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ApplicationCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AgentRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "caseId" TEXT,
  "runType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "input" TEXT,
  "output" TEXT,
  "error" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentRun_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ApplicationCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CaseLearning" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "caseId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "lessons" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CaseLearning_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ApplicationCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CandidateProfile_candidateId_idx" ON "CandidateProfile" ("candidateId");
CREATE INDEX IF NOT EXISTS "Opportunity_candidateId_idx" ON "Opportunity" ("candidateId");
CREATE INDEX IF NOT EXISTS "ApplicationCase_candidateId_idx" ON "ApplicationCase" ("candidateId");
CREATE INDEX IF NOT EXISTS "ApplicationCase_opportunityId_idx" ON "ApplicationCase" ("opportunityId");
CREATE INDEX IF NOT EXISTS "Artifact_caseId_idx" ON "Artifact" ("caseId");
CREATE INDEX IF NOT EXISTS "AgentRun_caseId_idx" ON "AgentRun" ("caseId");
CREATE INDEX IF NOT EXISTS "CaseLearning_caseId_idx" ON "CaseLearning" ("caseId");
