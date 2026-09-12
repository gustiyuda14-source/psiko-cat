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
  if (session.role === "admin") redirect("/admin");

  return (
    <div className="ornate flex min-h-[100dvh] flex-col bg-background lg:h-[100dvh] lg:flex-row">
      <Sidebar name={session.name} username={session.username} />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
