import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase Pooler (PgBouncer) — untuk query runtime & migrations
    // Tip: Saat menjalankan `prisma migrate dev`, gunakan DIRECT_URL di sini
    // agar bypass PgBouncer. Setelah migration selesai, kembalikan ke DATABASE_URL.
    url: process.env["DATABASE_URL"],
  },
});
