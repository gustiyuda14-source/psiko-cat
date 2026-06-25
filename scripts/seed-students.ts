/**
 * Seed 13 peserta didik + 1 admin ke tabel users.
 * Jalankan: npx tsx scripts/seed-students.ts
 *
 * Output: daftar credential yang bisa dicetak/dibagikan.
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function toUsername(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ".");
}

function generatePassword(username: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pwd = "";
  for (let i = 0; i < 6; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

const STUDENTS = [
  { name: "Salfa",      gender: "P" },
  { name: "Dillah",     gender: "P" },
  { name: "Ehud",       gender: "L" },
  { name: "Dhea",       gender: "P" },
  { name: "Febhy",      gender: "P" },
  { name: "Lingga",     gender: "L" },
  { name: "Fajar",      gender: "L" },
  { name: "Putu Cinta", gender: "P" },
  { name: "Aurel",      gender: "P" },
  { name: "Didan",      gender: "L" },
  { name: "Agil",       gender: "L" },
  { name: "Gita",       gender: "P" },
  { name: "Iren",       gender: "P" },
];

const ADMIN = { name: "Admin", username: "admin", password: "Admin@2025!" };

async function main() {
  console.log("\n=== SEED PESERTA DIDIK ===\n");

  const credentials: Array<{ name: string; username: string; password: string; role: string }> = [];

  // Upsert admin
  const adminHash = await bcrypt.hash(ADMIN.password, 12);
  const { error: adminErr } = await supabase
    .from("users")
    .upsert(
      {
        name: ADMIN.name,
        email: `${ADMIN.username}@psikotes.internal`,
        username: ADMIN.username,
        password_hash: adminHash,
        role: "admin",
        gender: null,
      },
      { onConflict: "username" }
    );
  if (adminErr) {
    console.error("❌ Gagal seed admin:", adminErr.message);
  } else {
    credentials.push({ name: ADMIN.name, username: ADMIN.username, password: ADMIN.password, role: "admin" });
    console.log(`✓ admin  |  ${ADMIN.username}  |  ${ADMIN.password}`);
  }

  // Upsert peserta
  for (const s of STUDENTS) {
    const username = toUsername(s.name);
    const password = generatePassword(username);
    const hash = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("users")
      .upsert(
        {
          name: s.name,
          email: `${username}@psikotes.internal`,
          username,
          password_hash: hash,
          role: "peserta",
          gender: s.gender,
        },
        { onConflict: "username" }
      );

    if (error) {
      console.error(`❌ Gagal seed ${s.name}:`, error.message);
    } else {
      credentials.push({ name: s.name, username, password, role: "peserta" });
      console.log(`✓ ${s.name.padEnd(12)} |  ${username.padEnd(12)}  |  ${password}`);
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║           KARTU CREDENTIAL PESERTA                  ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║ NAMA           USERNAME       PASSWORD               ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  for (const c of credentials.filter((c) => c.role === "peserta")) {
    const row = `║ ${c.name.padEnd(14)} ${c.username.padEnd(14)} ${c.password.padEnd(22)} ║`;
    console.log(row);
  }
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("\nURL Login: https://psiko-cat.vercel.app/login");
  console.log("URL Admin: username=admin  |  password=Admin@2025!\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
