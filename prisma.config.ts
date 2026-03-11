import "dotenv/config";
import { defineConfig } from "prisma/config";

const url = process.env["DATABASE_URL"];
if (!url || !url.trim()) {
  throw new Error('DATABASE_URL is required for Prisma CLI (set it in .env or environment).');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: url.trim(),
  },
});
