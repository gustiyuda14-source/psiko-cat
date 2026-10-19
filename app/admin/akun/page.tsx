import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAccount } from "@/lib/accounts";
import { PageHeader } from "@/app/components/ui";
import AccountsManager from "./AccountsManager";

// Kelola akun peserta (padanan admin.html di dajiks-cest). Hak admin dibaca ulang dari database.
export default async function AkunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const me = await findAccount(session.username);
  if (!me?.admin || !me.aktif) redirect("/dashboard");

  return (
    <div className="app-page">
        <PageHeader
          kicker="Admin"
          title="Akun peserta"
          description="Buat akun, reset password, aktif/nonaktifkan, dan ganti nama."
        />
        <AccountsManager />
    </div>
  );
}
