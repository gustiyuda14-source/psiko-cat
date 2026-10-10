// Aturan akun mengikuti dajiks-cest (api/admin.js): nama huruf besar, ID berurutan p001….
// Password: nama depan + @ atau * + 4 angka acak (mudah diingat peserta). Murni (tanpa I/O) supaya bisa dites.
import { createHash, randomInt } from "node:crypto";

export const MAX_NAMES = 50; // per permintaan; UI mengirim per 25
export const MAX_NAME_LEN = 120;

export const PW_SYMBOLS = "@*";

/** Kata nama untuk password: kata pertama yang punya ≥3 huruf, huruf kecil tanpa aksen, maks 12 huruf. */
export function nameWord(nama: string): string {
  const words = nama.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z]/g, ""));
  return (words.find((w) => w.length >= 3) ?? "peserta").slice(0, 12);
}

/** Contoh: "BUDI SANTOSO" → "budi@4821", "I KETUT ARYA" → "ketut*0937". */
export const genPassword = (nama: string): string =>
  nameWord(nama) + PW_SYMBOLS[randomInt(PW_SYMBOLS.length)] + String(randomInt(10_000)).padStart(4, "0");

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
