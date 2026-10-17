import type { ReactNode } from "react";
import Link from "next/link";
import { LembarSheet, type Petunjuk } from "@/app/components/LembarSheet";
import { KoranCols, LembarHead, PauliStrip } from "@/app/components/LembarSpesimen";
import { NapTrendChart } from "@/app/dashboard/ActivityCharts";
import { getSession } from "@/lib/auth";
import { FUNDAMENTAL, KORAN, PAULI, PAULI_LATIHAN } from "@/lib/fundamental";
import { supabaseAdmin } from "@/lib/supabase-admin";
import "@/app/lembar.css";

const PAKET = FUNDAMENTAL.filter((m) => m.grup === "Rekening Koran");

type Row = { kode: "koran" | "pauli"; mode: "tes" | "latihan"; operasi: "tambah" | "kali" | null; per_periode: number[]; stats: Record<string, number>; created_at: string };

// Satu grup = hasil yang sebanding satu sama lain (operasi dan durasi sama), jadi tren tidak mencampur keduanya.
const GRUP = [
  { key: "koran-tambah", label: "Rekening Koran · Tambah", match: (r: Row) => r.kode === "koran" && r.operasi === "tambah" },
  { key: "koran-kali", label: "Rekening Koran · Kali", match: (r: Row) => r.kode === "koran" && r.operasi === "kali" },
  { key: "pauli-tes", label: "Tes Pauli · 60 menit", match: (r: Row) => r.kode === "pauli" && r.mode === "tes" },
  { key: "pauli-latihan", label: "Tes Pauli · Latihan", match: (r: Row) => r.kode === "pauli" && r.mode === "latihan" },
];

const fmt = (x: number) => (Math.round(x * 10) / 10).toLocaleString("id-ID");
const tanggal = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const menit = (detik: number) => detik / 60;

// Kartu + lembar petunjuk per paket. Operasi dan mode tetap dipilih di layar awal sesi.
const SHEET: Record<string, { side: string; c: number; spec: ReactNode; petunjuk: Petunjuk }> = {
  koran: {
    side: "Tambah atau Kali",
    c: 8,
    spec: <KoranCols n={20} rows={13} on={2} />,
    petunjuk: {
      ringkas: `Grid ${KORAN.kolom} kolom × ${KORAN.baris} angka, dikerjakan per kolom dari atas ke bawah.`,
      fakta: [
        ["Mode Tes", `${KORAN.detik} detik per kolom`],
        ["Mode Latihan", "Tanpa batas waktu"],
        ["Operasi", "Tambah atau Kali"],
        ["Jawab", "Numpad atau keyboard"],
      ],
      aturan: [
        "Jumlahkan (atau kalikan) dua angka berdekatan, lalu ketik angka satuannya saja. Contoh: 7 + 8 = 15, tulis 5.",
        "Jawaban tidak bisa diubah. Kolom penuh atau waktu kolom habis = pindah ke kolom berikutnya.",
        "Operasi dan mode (Tes atau Latihan) dipilih di layar berikutnya. Hanya Mode Tes yang tercatat di Perkembangan.",
      ],
    },
  },
  pauli: {
    side: `Tambah, ${menit(PAULI.periode * PAULI.detik)} menit`,
    c: 4,
    spec: <PauliStrip />,
    petunjuk: {
      ringkas: `${PAULI.periode} periode × ${menit(PAULI.detik)} menit tanpa henti, dengan kurva kerja per periode.`,
      fakta: [
        ["Tes", `${PAULI.periode} × ${menit(PAULI.detik)} menit`],
        ["Latihan", `${PAULI_LATIHAN.periode} × ${menit(PAULI_LATIHAN.detik)} menit`],
        ["Operasi", "Tambah"],
        ["Jawab", "Numpad atau keyboard"],
      ],
      aturan: [
        "Jumlahkan dua angka berdekatan dari atas ke bawah, ketik angka satuannya saja. Kerjakan tanpa henti.",
        `Tiap ${menit(PAULI.detik)} menit muncul tanda garis di posisi terakhirmu. Jangan memeriksa ulang.`,
        "Tes atau Latihan, dan aturan saat garis (pindah kolom atau lanjut), dipilih di layar berikutnya. Keduanya tercatat di Perkembangan.",
      ],
    },
  },
};

function GrupPanel({ rows }: { rows: Row[] }) {
  const last = rows[0];
  const st = last.stats;
  const koran = last.kode === "koran";
  const utama = (r: Row) => (r.kode === "koran" ? r.stats.rata : r.stats.total);
  const maks = koran ? KORAN.baris - 1 : Math.max(1, ...rows.map(utama)) * 1.15;
  const sessions = rows.slice(0, 30).map((r) => ({ status: "COMPLETED", nap_score: utama(r), completed_at: r.created_at, created_at: r.created_at }));
  return (
    <div className="lb-prog">
      <div>
        <div className="lb-prog-val">{fmt(utama(last))}</div>
        <div className="lb-prog-unit">{koran ? "benar per kolom, rata-rata" : `jawaban benar dari ${last.per_periode.length} periode`}</div>
        <div className="lb-prog-meta">
          Terakhir {tanggal(last.created_at)}, {rows.length} sesi
        </div>
        <dl className="lb-prog-dl">
          {koran ? (
            <>
              <div>
                <dt>Keajegan</dt>
                <dd>
                  {fmt(st.keajegan)}
                  <span>selisih kolom, makin kecil makin stabil</span>
                </dd>
              </div>
              <div>
                <dt>Ketahanan</dt>
                <dd>
                  {st.ketahanan > 0 ? "+" : ""}
                  {fmt(st.ketahanan)}
                  <span>paruh akhir − awal, positif = makin cepat</span>
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Schwankung</dt>
                <dd>
                  ±{fmt(st.schwankung)} ({fmt(st.schwankungPct)}%)<span>makin kecil makin stabil</span>
                </dd>
              </div>
              <div>
                <dt>Puncak</dt>
                <dd>
                  P{st.gipfel}
                  <span>periode benar terbanyak, naik {fmt(st.steighohe)}%</span>
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
      <NapTrendChart
        sessions={sessions}
        title={koran ? "Tren rata-rata benar per kolom" : "Tren jumlah benar"}
        label={koran ? "Rata-rata" : "Benar"}
        max={maks}
        threshold={null}
      />
    </div>
  );
}

export default async function KraepelinPage({ searchParams }: { searchParams: Promise<{ grup?: string }> }) {
  const session = (await getSession())!;
  // Tabel belum dibuat (migrasi belum dijalankan) = error; diperlakukan sama dengan riwayat kosong.
  const { data, error } = await supabaseAdmin
    .from("latihan_koran_results")
    .select("kode, mode, operasi, per_periode, stats, created_at")
    .eq("user_id", session.sub)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) console.error("[KraepelinPage] riwayat", error);
  const rows = (data ?? []) as Row[];
  const grup = GRUP.map((g) => ({ ...g, rows: rows.filter(g.match) })).filter((g) => g.rows.length);
  const { grup: raw } = await searchParams;
  const aktif = grup.find((g) => g.key === raw) ?? grup[0];

  return (
    <div className="app-page lb">
      <LembarHead
        title="Tes Koran"
        desc="Latihan tes koran: jumlahkan dua angka berdekatan, tulis angka satuannya. Kraepelin pindah kolom tiap beberapa detik, Pauli dikerjakan tanpa henti 60 menit dengan tanda garis tiap 3 menit. Grid dibuat ulang setiap sesi, jawab dengan numpad atau keyboard."
        meta={[`${PAKET.length} paket`, "Kraepelin dan Pauli"]}
      />

      <div className="lb-sheets">
        {PAKET.map((m, i) => {
          const s = SHEET[m.kode];
          return (
            <LembarSheet
              key={m.kode}
              href={`/latihan/fundamental/${m.kode}`}
              code={`Paket ${String(i + 1).padStart(2, "0")}`}
              side={s?.side ?? m.kicker}
              title={m.label}
              line={m.desc}
              cta="Mulai latihan"
              layout={{ c: s?.c ?? 6, i }}
              spec={s?.spec ?? <KoranCols n={12} rows={6} />}
              petunjuk={s?.petunjuk ?? { ringkas: m.desc, fakta: [["Jawab", "Numpad atau keyboard"]], aturan: m.points }}
            />
          );
        })}
      </div>

      <section className="lb-sect" aria-labelledby="koran-prog-h">
        <h2 className="lb-sect-h" id="koran-prog-h">
          Perkembangan
        </h2>
        <p className="lb-sect-p">Nilai mentah, tanpa norma: untuk membandingkan dirimu dengan sesi sebelumnya, bukan tanda lulus atau tidak.</p>
        {!aktif ? (
          <div className="lb-empty">
            <b>Belum ada riwayat Tes Koran</b>
            <p>Selesaikan Rekening Koran Mode Tes atau Tes Pauli (Tes maupun Latihan). Hasilnya tercatat di sini supaya perkembanganmu terlihat.</p>
          </div>
        ) : (
          <>
            {grup.length > 1 && (
              <nav className="lb-grp" aria-label="Kelompok hasil">
                {grup.map((g) => (
                  <Link key={g.key} className="lb-chip" href={`/dashboard/kraepelin?grup=${g.key}`} scroll={false} aria-current={g === aktif ? "true" : undefined}>
                    {g.label}
                  </Link>
                ))}
              </nav>
            )}
            {grup.length === 1 && <p className="lb-prog-meta">{aktif.label}</p>}
            <GrupPanel rows={aktif.rows} />
          </>
        )}
      </section>
    </div>
  );
}
