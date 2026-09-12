type SessionRow = {
  status: string;
  nap_score: number | null;
  completed_at: string | null;
  created_at: string;
};

const PASSING_NAP = 61;

function weekStart(d: Date): Date {
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay(); // 0=Sun..6=Sat
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

function shortDate(ms: number): string {
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function ChartFrame({
  title,
  meta,
  children,
  footer,
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <figure className="surface-card space-y-3 p-4 sm:p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="tnum text-xs text-muted-foreground">{meta}</span>
      </figcaption>
      {children}
      {footer}
    </figure>
  );
}

/*
  Dua grafik di halaman ini masing-masing satu seri, jadi tidak ada legenda —
  judulnya sudah menamai serinya.

  Gold dipakai untuk menandai periode berjalan. Kontras gold terhadap permukaan
  putih hanya 2.4:1, di bawah 3:1, jadi mark emas tidak pernah berdiri sendiri:
  selalu diberi stroke gold gelap, label angka yang terlihat, dan padanan
  tabelnya di sr-only. Warna di sini menegaskan, bukan menjadi satu-satunya
  pembawa informasi.
*/

export function WeeklyFrequencyChart({ sessions }: { sessions: SessionRow[] }) {
  const WEEKS = 8;
  const currentWeekStart = weekStart(new Date());
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - (WEEKS - 1 - i) * 7);
    return { start: start.getTime(), count: 0 };
  });

  for (const s of sessions) {
    const t = weekStart(new Date(s.completed_at ?? s.created_at)).getTime();
    const bucket = buckets.find((b) => b.start === t);
    if (bucket) bucket.count++;
  }

  const total = buckets.reduce((s, b) => s + b.count, 0);
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const current = buckets[buckets.length - 1];

  const barW = 24;
  const gap = 8;
  const chartH = 52;
  const chartW = buckets.length * barW + (buckets.length - 1) * gap;

  return (
    <ChartFrame
      title="Frekuensi tes resmi"
      meta={`${total} sesi · 8 minggu`}
      footer={
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{shortDate(buckets[0].start)}</span>
          <span>Minggu ini · {current.count}</span>
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        width="100%"
        height={chartH}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Jumlah tes resmi per minggu selama ${WEEKS} minggu terakhir, total ${total} sesi.`}
      >
        {buckets.map((b, i) => {
          const h = b.count === 0 ? 2 : Math.max(6, (b.count / max) * chartH);
          const isCurrent = i === buckets.length - 1;
          return (
            <rect
              key={b.start}
              x={i * (barW + gap)}
              y={chartH - h}
              width={barW}
              height={h}
              rx={3}
              className={isCurrent ? "fill-accent stroke-accent-strong" : "fill-primary/16"}
              strokeWidth={isCurrent ? 1 : 0}
            >
              <title>
                {`Minggu ${shortDate(b.start)}: ${b.count} sesi`}
              </title>
            </rect>
          );
        })}
      </svg>

      <ul className="sr-only">
        {buckets.map((b) => (
          <li key={b.start}>{`Minggu ${shortDate(b.start)}: ${b.count} sesi`}</li>
        ))}
      </ul>
    </ChartFrame>
  );
}

export function NapTrendChart({ sessions }: { sessions: SessionRow[] }) {
  const points = sessions
    .filter((s) => s.nap_score != null)
    .sort(
      (a, b) =>
        new Date(a.completed_at ?? a.created_at).getTime() -
        new Date(b.completed_at ?? b.created_at).getTime()
    );

  if (points.length === 0) {
    return (
      <ChartFrame title="Tren skor NAP" meta="belum ada data">
        <p className="py-6 text-center text-xs text-muted-foreground">
          Tren muncul setelah tes resmi pertama selesai dihitung.
        </p>
      </ChartFrame>
    );
  }

  const chartW = 280;
  const chartH = 76;
  const padX = 10;
  const padY = 12;
  const domainMax = 100;

  const xFor = (i: number) =>
    points.length === 1 ? chartW / 2 : padX + (i / (points.length - 1)) * (chartW - padX * 2);
  const yFor = (score: number) =>
    padY + (1 - Math.min(score, domainMax) / domainMax) * (chartH - padY * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.nap_score!).toFixed(1)}`)
    .join(" ");

  const last = points[points.length - 1];
  const thresholdY = yFor(PASSING_NAP);

  return (
    <ChartFrame
      title="Tren skor NAP"
      meta={`${points.length} sesi selesai`}
      footer={
        <p className="text-xs text-muted-foreground">
          Garis putus-putus menandai ambang lulus{" "}
          <span className="tnum font-semibold text-foreground">{PASSING_NAP}</span>. Skor terakhir{" "}
          <span className="tnum font-semibold text-foreground">{last.nap_score!.toFixed(1)}</span>.
        </p>
      }
    >
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        width="100%"
        height={chartH}
        role="img"
        aria-label={`Tren skor NAP dari ${points.length} sesi selesai. Skor terakhir ${last.nap_score!.toFixed(1)} dari 100, ambang lulus ${PASSING_NAP}.`}
      >
        {/* Garis acuan: skor tanpa ambangnya tidak bisa dinilai bagus atau tidak. */}
        <line
          x1={0}
          x2={chartW}
          y1={thresholdY}
          y2={thresholdY}
          strokeWidth={1}
          strokeDasharray="3 4"
          className="stroke-border-strong/70"
        />

        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary/45"
          />
        )}

        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(p.nap_score!)}
              r={isLast ? 5 : 4}
              strokeWidth={2}
              className={
                isLast
                  ? "fill-accent stroke-accent-strong"
                  : "fill-primary/25 stroke-card"
              }
            >
              <title>
                {`Sesi ${i + 1}: NAP ${p.nap_score!.toFixed(1)}`}
              </title>
            </circle>
          );
        })}

        {/* Label langsung hanya pada titik yang ditegaskan, bukan di tiap titik. */}
        <text
          x={Math.min(xFor(points.length - 1) + 8, chartW - 2)}
          y={Math.max(yFor(last.nap_score!) - 8, 12)}
          textAnchor="end"
          className="tnum fill-foreground text-[10px] font-semibold"
        >
          {last.nap_score!.toFixed(1)}
        </text>
      </svg>

      <ul className="sr-only">
        {points.map((p, i) => (
          <li key={i}>{`Sesi ${i + 1}: NAP ${p.nap_score!.toFixed(1)}`}</li>
        ))}
      </ul>
    </ChartFrame>
  );
}
