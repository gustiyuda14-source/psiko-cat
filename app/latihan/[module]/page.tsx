import { redirect } from "next/navigation";

export default async function LatihanRedirect({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  redirect(`/dashboard/latihan/${module}`);
}
