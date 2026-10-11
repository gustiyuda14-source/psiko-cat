import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui";
import { getSession } from "@/lib/auth";
import KosakataList from "./KosakataList";

export default async function KosakataPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="app-page space-y-6">
      <PageHeader
        kicker="Kosakata"
        title="Kosakata verbal"
        description="Kata baku, kata serapan, dan kata langka yang sering muncul di soal sinonim, antonim, dan analogi. Tiap kata lengkap dengan arti, sinonim, antonim, dan contoh kalimat. Tandai kata yang sudah hafal, lalu nyalakan mode hafalan untuk menguji diri."
      />
      <KosakataList userId={session.sub} />
    </div>
  );
}
