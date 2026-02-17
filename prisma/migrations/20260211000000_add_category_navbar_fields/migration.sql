-- Categories tablosuna menü/sıralama ve navbar alanları ekleniyor (SQLite uyumlu)
ALTER TABLE "categories" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "categories" ADD COLUMN "showOnNavbar" BOOLEAN NOT NULL DEFAULT false;
