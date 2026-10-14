type ReviewRow = { id: string; sequence_number: number | null; is_active: boolean; created_at: string };

/**
 * Satu baris per nomor soal untuk pembahasan sesi. Setelah butir ditukar di tempat
 * (`seed-kecerdasan-kal.ts --swap`), satu nomor punya baris lama (nonaktif) dan baru.
 * Urutan pilihan: baris yang dijawab → baris terbaru yang sudah ada saat sesi mulai
 * (yang dilihat peserta) → baris aktif.
 */
export function pickReviewRows<T extends ReviewRow>(rows: T[], answered: Set<string>, startedAt: string | null): T[] {
  const start = startedAt ? Date.parse(startedAt) : null;
  const groups = new Map<number, T[]>();
  for (const row of rows) {
    const seq = row.sequence_number ?? -1;
    groups.set(seq, [...(groups.get(seq) ?? []), row]);
  }
  const picked: T[] = [];
  for (const group of groups.values()) {
    const seen = start === null ? [] : group.filter((r) => Date.parse(r.created_at) <= start);
    const row =
      group.find((r) => answered.has(r.id)) ??
      seen.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] ??
      group.find((r) => r.is_active);
    if (row) picked.push(row);
  }
  return picked.sort((a, b) => (a.sequence_number ?? -1) - (b.sequence_number ?? -1));
}
