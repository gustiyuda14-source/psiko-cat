import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { keswaPaket } from "@/lib/keswa-bank";
import { keswaRiwayat } from "@/lib/keswa-attempts";
import "@/app/fundamental.css";
import "@/app/keswa.css";
import KeswaSession from "./KeswaSession";

// Di luar app/dashboard supaya sidebar tidak tampil saat simulasi berjalan. Ke browser hanya teks soal.
export default async function KeswaSessionPage({ params }: { params: Promise<{ paket: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const paket = Number((await params).paket);
  const bank = Number.isInteger(paket) ? keswaPaket(paket) : undefined;
  if (!bank) notFound();
  const riwayat = await keswaRiwayat(session.sub);

  return <KeswaSession paket={paket} soal={bank.soal} userId={session.sub} percobaan={riwayat[paket]?.length ?? 0} />;
}
