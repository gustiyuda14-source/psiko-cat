import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fundamentalMeta, generateKoran, generateIsian, generatePauli } from "@/lib/fundamental";
import "@/app/fundamental.css";
import IsianSession from "./IsianSession";
import DeretSession from "./DeretSession";
import PauliSession from "./PauliSession";

// Di luar app/dashboard supaya sidebar tidak tampil saat drilling berjalan (sama seperti drill). Auth dijamin proxy.ts.
// Soal dibangkitkan per request; "Ulangi" memanggil router.refresh() untuk set soal baru.
export default async function FundamentalSessionPage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const meta = fundamentalMeta(kode);
  if (!meta) notFound();
  await connection();
  // key baru tiap request: refresh = sesi baru dari nol (state klien ikut ter-reset).
  const key = crypto.randomUUID();

  if (meta.kind === "pauli") return <PauliSession key={key} meta={meta} grid={generatePauli()} />;
  return meta.kind === "deret" ? (
    <DeretSession key={key} meta={meta} grid={generateKoran()} />
  ) : (
    <IsianSession key={key} meta={meta} items={generateIsian(kode)} />
  );
}
