import { redirect } from "next/navigation";
import SiteShell from "@/templates/layout/SiteShell";
import AdminOrdersClient from "@/templates/admin/AdminOrdersClient";
import { readSessionFromCookies } from "@/server/auth/session";

export const dynamic = "force-dynamic";
export default async function AdminOrdersPage() {
  const session = await readSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return <SiteShell><AdminOrdersClient /></SiteShell>;
}
