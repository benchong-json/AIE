CREATE TABLE "ResearchSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "snippet" TEXT,
    "publishedAt" DATETIME,
    "retrievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT,
    CONSTRAINT "ResearchSource_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ApplicationCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ResearchSource_caseId_url_key" ON "ResearchSource"("caseId", "url");
CREATE INDEX "ResearchSource_caseId_idx" ON "ResearchSource"("caseId");
CREATE INDEX "ResearchSource_category_idx" ON "ResearchSource"("category");

