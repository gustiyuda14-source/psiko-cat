import { Fragment } from "react";

// Pecahan di bank ditulis teks polos: "3/4" dan campuran "1 1/4". Sebagai teks,
// "1 1/4" terbaca "11/4". Tampilkan semua pecahan bersusun (pembilang di atas,
// penyebut di bawah), bilangan bulat campuran di sebelah kirinya.
// Bukan pecahan, dibiarkan: "ke-2/3" (label), "1/0,04" dan "270/3.600" (penyebut
// desimal/ribuan), "1/2/3". Titik akhir kalimat ("= 1 1/4.") tetap cocok.
const FRACTION = /(?<![\d/.,-])(?:(\d+) )?(\d+)\/(\d+)(?![\d/]|[.,]\d)/g;

export function MathText({ text }: { text: string }) {
  const parts = text.split(FRACTION);
  if (parts.length === 1) return text;
  // split dengan 3 grup: [teks, bulat|undefined, pembilang, penyebut, teks, ...]
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 4) {
    if (parts[i]) out.push(<Fragment key={i}>{parts[i]}</Fragment>);
    if (i + 3 >= parts.length) continue;
    const [whole, num, den] = [parts[i + 1], parts[i + 2], parts[i + 3]];
    out.push(
      <span key={`f${i}`} className="frac" aria-label={`${whole ? `${whole} ` : ""}${num} per ${den}`}>
        {whole && <span aria-hidden="true">{whole}</span>}
        <span className="frac__f" aria-hidden="true">
          <span>{num}</span>
          <span>{den}</span>
        </span>
      </span>
    );
  }
  return out;
}
