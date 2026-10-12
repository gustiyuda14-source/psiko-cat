import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { drillVersi, getDrillItem, type DrillItem } from "@/lib/drill-bank";

// Analisis pengecoh drill: sebaran opsi pada percobaan PERTAMA tiap peserta (view drill_answer_stats,
// docs/rencana/sql/drill-answers.sql). Hanya jawaban untuk versi soal yang sekarang yang dihitung.

/** Di bawah jumlah ini persentase belum bisa dipercaya; tanda kualitas tidak dipasang. */
export const MIN_N = 30;
const MATI = 5; // pengecoh dipilih < 5% = tidak berfungsi

export type OpsiStat = { key: string; teks: string; n: number; pct: number; kunci: boolean; mati: boolean };
export type ItemStat = { item: DrillItem; n: number; benarPct: number; opsi: OpsiStat[]; tanda: string[] };

export async function analisisPengecoh(kartu: string): Promise<{ items: ItemStat[]; error?: string }> {
  const { data, error } = await supabaseAdmin.from("drill_answer_stats").select("item_id, versi, pilihan, n").like("item_id", `${kartu}-%`);
  if (error) return { items: [], error: error.message };

  const counts = new Map<string, Map<string, number>>();
  for (const r of data as { item_id: string; versi: string; pilihan: string; n: number }[]) {
    const it = getDrillItem(r.item_id);
    if (!it || drillVersi(it) !== r.versi) continue;
    const m = counts.get(it.id) ?? new Map<string, number>();
    m.set(r.pilihan, (m.get(r.pilihan) ?? 0) + r.n);
    counts.set(it.id, m);
  }

  const items = [...counts].map(([id, m]): ItemStat => {
    const item = getDrillItem(id)!, n = [...m.values()].reduce((a, b) => a + b, 0);
    const kunci = [...item.kunci].sort().join("");
    // Soal pilih-dua: tiap huruf dihitung dari semua pilihan yang memuatnya.
    const opsi = Object.entries(item.opsi).map(([key, teks]) => {
      const c = [...m].reduce((t, [p, v]) => t + (p.includes(key) ? v : 0), 0), pct = (c / n) * 100, isKey = item.kunci.includes(key);
      return { key, teks, n: c, pct, kunci: isKey, mati: !isKey && n >= MIN_N && pct < MATI };
    });
    const benarPct = ((m.get(kunci) ?? 0) / n) * 100, tanda: string[] = [];
    if (n < MIN_N) tanda.push("data sedikit");
    else {
      const keyMin = Math.min(...opsi.filter((o) => o.kunci).map((o) => o.n));
      if (opsi.some((o) => !o.kunci && o.n > keyMin)) tanda.push("pengecoh mengalahkan kunci");
      const mati = opsi.filter((o) => o.mati).length;
      if (mati) tanda.push(`${mati} pengecoh mati`);
      if (benarPct > 90) tanda.push("terlalu mudah");
      if (benarPct < 20) tanda.push("terlalu sulit");
    }
    return { item, n, benarPct, opsi, tanda };
  });
  return { items };
}
