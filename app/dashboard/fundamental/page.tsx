import { FUNDAMENTAL } from "@/lib/fundamental";
import { LembarHead } from "@/app/components/LembarSpesimen";
import "@/app/lembar.css";
import FundamentalCatalog from "./FundamentalCatalog";

const count = (grup: string) => FUNDAMENTAL.filter((m) => m.grup === grup).length;

export default function FundamentalPage() {
  return (
    <div className="app-page lb">
      <LembarHead
        title="Drilling fundamental"
        desc="Latihan hitung dasar sebelum masuk Berpikir Praktis dan Sikap Kerja: perkalian cepat dan pecahan. Soal dibuat ulang setiap sesi, jawab dengan numpad atau keyboard."
        meta={[`${count("Penguatan Dasar")} paket`, "Penguatan Dasar"]}
      />
      <FundamentalCatalog />
    </div>
  );
}
