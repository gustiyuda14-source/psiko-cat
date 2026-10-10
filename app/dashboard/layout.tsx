import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  // Seperti akun admin di dajiks-cest (p002): admin = peserta biasa + menu Admin di sidebar.

  return (
    <div className="min-h-[100dvh] bg-background">
      <Sidebar name={session.name} username={session.username} isAdmin={session.role === "admin"} />
      <main className="lg:ml-[var(--sidebar-width)]">{children}</main>
    </div>
  );
}
