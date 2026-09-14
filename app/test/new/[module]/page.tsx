import { notFound, redirect } from "next/navigation";
import { SLUG_TO_MODULE } from "@/lib/test-config";

// Server component: buat test session standalone (1 modul), redirect ke overview
export default async function NewSingleModuleTestPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();

  redirect("/dashboard/simulasi");
}
