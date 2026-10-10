// Bacaan/wacana soal (panel di dalam .q-card): paragraf rata kiri-kanan, baris "• …" jadi daftar,
// tabel opsional. Dipakai simulasi, latihan, drilling, dan pembahasan.

export type PassageTable = { judul?: string; kolom: string[]; baris: string[][] };

type Block = { list: false; text: string } | { list: true; items: string[] };

function blocks(paragraphs: string[]): Block[] {
  const out: Block[] = [];
  for (const line of paragraphs.flatMap((p) => p.split("\n")).map((l) => l.trim()).filter(Boolean)) {
    const bullet = line.match(/^(?:•\s*|[-–]\s+)(.+)$/);
    const last = out[out.length - 1];
    if (!bullet) out.push({ list: false, text: line });
    else if (last?.list) last.items.push(bullet[1]);
    else out.push({ list: true, items: [bullet[1]] });
  }
  return out;
}

export default function QuestionPassage({
  text,
  paragraphs,
  table,
  compact = false,
}: {
  text?: string | null;
  paragraphs?: string[];
  table?: PassageTable;
  compact?: boolean;
}) {
  const parts = blocks(paragraphs ?? (text ? [text] : []));
  if (!parts.length && !table) return null;
  const size = compact ? "text-sm leading-6" : "text-base leading-7";

  return (
    <section aria-label="Bacaan" className={`q-passage space-y-3 ${compact ? "is-compact" : ""}`}>
      {parts.map((b, i) =>
        b.list ? (
          <ul key={i} className={`list-disc space-y-1.5 pl-5 text-justify text-foreground marker:text-muted-foreground ${size}`}>
            {b.items.map((it, j) => (
              <li key={j} className="hyphens-auto pl-1">{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className={`text-justify text-foreground hyphens-auto ${size}`}>{b.text}</p>
        )
      )}
      {table && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm tnum">
            {table.judul && <caption className="pb-2 text-left font-semibold text-foreground">{table.judul}</caption>}
            <thead>
              <tr>
                {table.kolom.map((c) => (
                  <th key={c} scope="col" className="border border-border bg-[var(--surface-inset)] px-3 py-2 text-left font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.baris.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={`border border-border px-3 py-2 ${j ? "text-right" : "font-medium"}`}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
