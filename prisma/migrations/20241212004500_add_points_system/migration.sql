-- AlterTable
ALTER TABLE "Student" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "awardedById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("awardedById") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);