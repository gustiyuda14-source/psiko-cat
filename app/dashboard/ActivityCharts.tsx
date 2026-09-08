type SessionRow = {
  status: string;
  nap_score: number | null;
  completed_at: string | null;
  created_at: string;
};

function weekStart(d: Date): Date {
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  const day = monday.getDay(); // 0=Sun..6=Sat
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return monday;
}

// Sparkline bar chart: jumlah attempt resmi per minggu, 8 minggu terakhir.
// Minggu-minggu lama pakai warna redup, minggu berjalan pakai warna aksen (gold) —
// pola "de-emphasis hue, current period in accent" dari stat-tile sparkline.
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

  const barW = 22;
  const gap = 6;
  const chartH = 40;
  const chartW = buckets.length * barW + (buckets.length - 1) * gap;

  return (
    <div className="surface-card space-y-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Frekuensi Tes Resmi</p>
        <p className="text-xs text-muted-foreground">{total} · 8 minggu terakhir</p>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH} preserveAspectRatio="none">
        {buckets.map((b, i) => {
          const h = b.count === 0 ? 2 : Math.max(4, (b.count / max) * chartH);
          const isCurrent = i === buckets.length - 1;
          return (
            <rect
              key={b.start}
              x={i * (barW + gap)}
              y={chartH - h}
              width={barW}
              height={h}
              rx={4}
              className={isCurrent ? "fill-accent" : "fill-primary/15"}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Sparkline line chart: tren nap_score dari sesi resmi selesai, berurutan waktu.
// Titik lama redup, titik terakhir diberi aksen + label nilai (endpoint label).
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
      <div className="surface-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Tren Skor NAP</p>
        <p className="text-xs text-muted-foreground">Belum ada tes selesai.</p>
      </div>
    );
  }

  const chartW = 260;
  const chartH = 48;
  const padX = 8;
  const padY = 8;
  const domainMax = 100;

  const xFor = (i: number) =>
    points.length === 1
      ? chartW / 2
      : padX + (i / (points.length - 1)) * (chartW - padX * 2);
  const yFor = (score: number) =>
    padY + (1 - Math.min(score, domainMax) / domainMax) * (chartH - padY * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.nap_score!).toFixed(1)}`)
    .join(" ");

  const last = points[points.length - 1];

  return (
    <div className="surface-card space-y-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Tren Skor NAP</p>
        <p className="text-xs text-muted-foreground">{points.length} sesi selesai</p>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH}>
        {points.length > 1 && (
          <path d={path} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary/40" />
        )}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(p.nap_score!)}
              r={isLast ? 4 : 2.5}
              className={isLast ? "fill-accent" : "fill-primary/15"}
            />
          );
        })}
        <text
          x={Math.min(xFor(points.length - 1), chartW - 20)}
          y={Math.max(yFor(last.nap_score!) - 8, 10)}
          textAnchor="end"
          className="fill-foreground text-[9px] font-mono font-semibold"
        >
          {last.nap_score!.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}
