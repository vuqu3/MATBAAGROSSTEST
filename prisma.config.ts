// Prisma CLI (migrate, generate) için yapılandırma — her zaman SQLite kullanır.
// PostgreSQL (localhost:5432) kullanılmaz; bağlantı projedeki dev.db dosyasına gider.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const envUrl = process.env["DATABASE_URL"];
// Sadece file: ile başlayan adresleri kabul et; aksi halde proje kökündeki dev.db kullan
const url =
  typeof envUrl === "string" && envUrl.trim().startsWith("file:")
    ? envUrl.trim()
    : "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
