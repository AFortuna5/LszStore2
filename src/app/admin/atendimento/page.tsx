import { redirect } from "next/navigation";
import SiteShell from "@/templates/layout/SiteShell";
import AdminInboxClient from "@/templates/admin/AdminInboxClient";
import { readSessionFromCookies } from "@/server/auth/session";

export const dynamic = "force-dynamic";
export default async function AdminInboxPage() {
  const session = await readSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return <SiteShell><AdminInboxClient /></SiteShell>;
}
