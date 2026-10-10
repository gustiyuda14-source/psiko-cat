// Aturan akun yang sama dengan dajiks-cest (api/admin.js): nama huruf besar, ID berurutan p001…,
// password acak 8 karakter tanpa huruf/angka yang mirip. Murni (tanpa I/O) supaya bisa dites.
import { createHash, randomInt } from "node:crypto";

export const PW_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // tanpa 0/o/1/l/i agar tidak salah ketik
export const MAX_NAMES = 50; // per permintaan; UI mengirim per 25
export const MAX_NAME_LEN = 120;

export const genPassword = (): string => Array.from({ length: 8 }, () => PW_ALPHABET[randomInt(PW_ALPHABET.length)]).join("");

export const cleanName = (n: unknown): string =>
  String(n ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleUpperCase("id");

/** n ID baru setelah nomor p### terbesar yang sudah ada (username lain diabaikan). */
export function nextIds(existing: string[], n: number): string[] {
  let max = 0;
  for (const u of existing) {
    const m = /^p(\d+)$/.exec(u);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return Array.from({ length: n }, (_, i) => "p" + String(max + 1 + i).padStart(3, "0"));
}

/** Sidik jari hash password di dalam token sesi: reset password = token lama tidak berlaku. */
export const sessionVersion = (passwordHash: string): string => createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
