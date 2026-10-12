import { FUNDAMENTAL } from "@/lib/fundamental";
import "@/app/fundamental.css";
import FundamentalCatalog from "./FundamentalCatalog";

const count = (grup: string) => FUNDAMENTAL.filter((m) => m.grup === grup).length;

export default function FundamentalPage() {
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
            Fundamental
          </span>
          <h1>Drilling fundamental</h1>
          <p>
            Latihan hitung dasar sebelum masuk Numerik dan Kecermatan: perkalian cepat, pecahan, dan rekening koran. Soal dibuat
            ulang setiap sesi, jawab dengan numpad atau keyboard.
          </p>
        </div>
        <dl className="fd-hero-stats">
          <div>
            <dt>Penguatan Dasar</dt>
            <dd className="tnum">{count("Penguatan Dasar")} paket</dd>
          </div>
          <div>
            <dt>Rekening Koran</dt>
            <dd className="tnum">{count("Rekening Koran")} paket</dd>
          </div>
        </dl>
      </header>
      <FundamentalCatalog />
    </div>
  );
}
