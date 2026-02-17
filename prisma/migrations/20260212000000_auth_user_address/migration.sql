-- User tablosuna yeni alanlar (SQLite: tek tek ADD COLUMN)
ALTER TABLE "users" ADD COLUMN "userType" TEXT NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE "users" ADD COLUMN "companyName" TEXT;
ALTER TABLE "users" ADD COLUMN "taxOffice" TEXT;
ALTER TABLE "users" ADD COLUMN "taxNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "phoneNumber" TEXT;

-- Address tablosu
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "postalCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");
