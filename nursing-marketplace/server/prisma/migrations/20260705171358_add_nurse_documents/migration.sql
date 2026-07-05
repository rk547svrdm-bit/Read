-- CreateTable
CREATE TABLE "NurseDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nurseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NurseDocument_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "NurseProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "NurseDocument_nurseId_idx" ON "NurseDocument"("nurseId");
