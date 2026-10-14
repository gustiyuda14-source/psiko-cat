import assert from "node:assert/strict";
import { pickReviewRows } from "./review-pick";

const t0 = "2026-01-01T00:00:00Z"; // butir lama dibuat
const t1 = "2026-02-01T00:00:00Z"; // sesi lama mulai
const t2 = "2026-03-01T00:00:00Z"; // swap: butir baru dibuat
const t3 = "2026-04-01T00:00:00Z"; // sesi baru mulai
const rows = [
  { id: "old73", sequence_number: 73, is_active: false, created_at: t0 },
  { id: "new73", sequence_number: 73, is_active: true, created_at: t2 },
  { id: "old74", sequence_number: 74, is_active: false, created_at: t0 },
  { id: "new74", sequence_number: 74, is_active: true, created_at: t2 },
  { id: "q1", sequence_number: 1, is_active: true, created_at: t0 },
];
const ids = (r: { id: string }[]) => r.map((x) => x.id);

// Sesi lama: 73 dijawab, 74 dilewati → keduanya butir lama, satu baris per nomor.
assert.deepEqual(ids(pickReviewRows(rows, new Set(["old73"]), t1)), ["q1", "old73", "old74"]);
// Sesi baru: butir aktif.
assert.deepEqual(ids(pickReviewRows(rows, new Set(["new73"]), t3)), ["q1", "new73", "new74"]);
// started_at kosong → baris aktif (atau yang dijawab).
assert.deepEqual(ids(pickReviewRows(rows, new Set(["old74"]), null)), ["q1", "new73", "old74"]);
// Baris nonaktif tanpa kembaran aktif dan belum ada saat sesi mulai → disembunyikan.
assert.deepEqual(ids(pickReviewRows([{ id: "x", sequence_number: 99, is_active: false, created_at: t2 }], new Set(), t1)), []);

console.log("review-pick OK");
