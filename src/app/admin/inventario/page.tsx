import { redirect } from "next/navigation";

import { readSessionFromCookies } from "@/server/auth/session";
import AdminInventoryClient from "@/templates/admin/AdminInventoryClient";
import SiteShell from "@/templates/layout/SiteShell";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await readSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return <SiteShell><AdminInventoryClient /></SiteShell>;
}
