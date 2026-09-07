import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createTestSessionAndRedirect } from "@/lib/test-session";

// Server component: buat test session (tryout lengkap, 3 modul) langsung, redirect ke overview
export default async function NewTestPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await createTestSessionAndRedirect(session.sub, ["KECERDASAN", "KECERMATAN", "KEPRIBADIAN"]);
}
