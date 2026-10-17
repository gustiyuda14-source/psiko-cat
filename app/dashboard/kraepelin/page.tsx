import { PaketCard } from "@/app/components/PaketCard";
import { EmptyState } from "@/app/components/ui";
import { NapTrendChart } from "@/app/dashboard/ActivityCharts";
import { getSession } from "@/lib/auth";
import { FUNDAMENTAL, KORAN } from "@/lib/fundamental";
import { supabaseAdmin } from "@/lib/supabase-admin";
import "@/app/fundamental.css";

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

function GrupPanel({ label, rows }: { label: string; rows: Row[] }) {
  const last = rows[0];
  const st = last.stats;
  const koran = last.kode === "koran";
  const utama = (r: Row) => (r.kode === "koran" ? r.stats.rata : r.stats.total);
  const maks = koran ? KORAN.baris - 1 : Math.max(1, ...rows.map(utama)) * 1.15;
  const sessions = rows.slice(0, 30).map((r) => ({ status: "COMPLETED", nap_score: utama(r), completed_at: r.created_at, created_at: r.created_at }));
  return (
    <div className="prog-panel">
      <div className="prog-hero">
        <span className="prog-label">{label}</span>
        <span className="prog-num">
          <strong>{fmt(utama(last))}</strong>
        </span>
        <span className="prog-status">{koran ? "benar per kolom, rata-rata" : `jawaban benar · ${last.per_periode.length} periode`}</span>
        <span className="prog-meta">
          Terakhir {tanggal(last.created_at)} · {rows.length} sesi
        </span>
      </div>
      <div className="prog-body">
        <NapTrendChart
          sessions={sessions}
          title={koran ? "Tren rata-rata benar per kolom" : "Tren jumlah benar"}
          label={koran ? "Rata-rata" : "Benar"}
          max={maks}
          threshold={null}
        />
        <dl className="prog-strip">
          {koran ? (
            <>
              <div>
                <dt>Keajegan</dt>
                <dd className="prog-big">
                  {fmt(st.keajegan)}
                  <span> selisih kolom, makin kecil makin stabil</span>
                </dd>
              </div>
              <div>
                <dt>Ketahanan</dt>
                <dd className="prog-big">
                  {st.ketahanan > 0 ? "+" : ""}
                  {fmt(st.ketahanan)}
                  <span> paruh akhir − awal, positif = makin cepat</span>
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Schwankung</dt>
                <dd className="prog-big">
                  ±{fmt(st.schwankung)}
                  <span> ({fmt(st.schwankungPct)}%) makin kecil makin stabil</span>
                </dd>
              </div>
              <div>
                <dt>Puncak</dt>
                <dd className="prog-big">
                  P{st.gipfel}
                  <span> periode benar terbanyak · naik {fmt(st.steighohe)}%</span>
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}

export default async function KraepelinPage() {
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

  return (
    <div className="app-page space-y-6">
      <header className="fd-hero">
        <svg className="fd-hero-radar" viewBox="0 0 420 420" aria-hidden="true">
          <circle cx="210" cy="210" r="200" />
          <circle cx="210" cy="210" r="140" />
          <circle cx="210" cy="210" r="80" />
          <path d="M210 0v420M0 210h420" />
        </svg>
        <div className="fd-hero-text">
          <span className="fd-hero-kicker">
            <i aria-hidden="true" />
            Kraepelin · Pauli
          </span>
          <h1>Tes Koran</h1>
          <p>
            Latihan tes koran: jumlahkan dua angka berdekatan, tulis angka satuannya. Kraepelin pindah kolom tiap beberapa detik, Pauli
            dikerjakan tanpa henti 60 menit dengan tanda garis tiap 3 menit. Grid dibuat ulang setiap sesi, jawab dengan numpad atau keyboard.
          </p>
        </div>
        <dl className="fd-hero-stats">
          <div>
            <dt>Tes Koran</dt>
            <dd className="tnum">{PAKET.length} paket</dd>
          </div>
        </dl>
      </header>

      <section className="prog !mt-0" aria-labelledby="koran-prog-h">
        <div className="prog-head">
          <h2 id="koran-prog-h">Perkembangan</h2>
          <p>Nilai mentah, tanpa norma: untuk membandingkan dirimu dengan sesi sebelumnya, bukan tanda lulus atau tidak.</p>
        </div>
        {grup.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat Tes Koran"
            description="Selesaikan Rekening Koran Mode Tes atau Tes Pauli (Tes maupun Latihan). Hasilnya tercatat di sini supaya perkembanganmu terlihat."
          />
        ) : (
          grup.map((g) => <GrupPanel key={g.key} label={g.label} rows={g.rows} />)
        )}
      </section>

      <div className="pc-grid">
        {PAKET.map((m, i) => (
          <PaketCard
            key={m.kode}
            href={`/latihan/fundamental/${m.kode}`}
            code={`Paket ${String(i + 1).padStart(2, "0")}`}
            tag={m.kind === "pauli" ? "Tambah · 60 menit" : "Tambah · Kali"}
            kicker={m.kicker}
            title={m.label}
            desc={m.desc}
            points={m.points}
            chips={m.contoh}
            level={m.level}
            cta="Mulai latihan"
          />
        ))}
      </div>
    </div>
  );
}
