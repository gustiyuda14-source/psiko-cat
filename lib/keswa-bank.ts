import "server-only";
import bank from "@/data/keswa-bank.json";
import type { KeswaKunci } from "@/lib/keswa-scoring";

// Bank simulasi Keswa hasil `npm run build:keswa` (bank/keswa/** → data/keswa-bank.json).
// SERVER ONLY: kelompok validitas ada di sini; ke browser hanya teks soal.

type Paket = { soal: string[]; kunci: KeswaKunci };
const BANK = bank as unknown as Record<string, Paket>;

export const KESWA_PAKET = Object.keys(BANK).map(Number);

export function keswaPaket(n: number): Paket | undefined {
  return BANK[String(n)];
}
