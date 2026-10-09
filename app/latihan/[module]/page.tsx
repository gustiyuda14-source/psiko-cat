import { notFound, redirect } from "next/navigation";
import { SLUG_TO_MODULE, latihanHref } from "@/lib/test-config";

// Latihan selalu per paket (/latihan/<modul>/<paket>). Rute tanpa paket dulu
// menarik SEMUA soal aktif module itu sekaligus; sekarang dibelokkan ke
// pemilih paket di dashboard. Komponen di folder ini masih dipakai rute per paket.
export default async function LatihanPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();
  redirect(latihanHref(moduleType));
}
