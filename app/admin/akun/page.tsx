import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findAccount } from "@/lib/accounts";
import { PageHeader, buttonStyles } from "@/app/components/ui";
import AccountsManager from "./AccountsManager";

// Kelola akun peserta (padanan admin.html di dajiks-cest). Hak admin dibaca ulang dari database.
export default async function AkunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const me = await findAccount(session.username);
  if (!me?.admin || !me.aktif) redirect("/dashboard");

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <PageHeader
          kicker="Admin"
          title="Akun peserta"
          description="Buat akun, reset password, aktif/nonaktifkan, dan ganti nama."
          actions={<Link href="/admin" className={buttonStyles({ variant: "secondary", size: "sm" })}>← Dashboard admin</Link>}
        />
        <AccountsManager />
      </div>
    </div>
  );
}
