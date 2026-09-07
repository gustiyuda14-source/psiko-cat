import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createTestSessionAndRedirect, SLUG_TO_MODULE } from "@/lib/test-session";

// Server component: buat test session standalone (1 modul), redirect ke overview
export default async function NewSingleModuleTestPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const moduleType = SLUG_TO_MODULE[slug];
  if (!moduleType) notFound();

  const session = await getSession();
  if (!session) redirect("/login");

  await createTestSessionAndRedirect(session.sub, [moduleType]);
}
