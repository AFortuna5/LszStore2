import { redirect } from "next/navigation";

import { readSessionFromCookies } from "@/server/auth/session";
import AdminCouponsClient from "@/templates/admin/AdminCouponsClient";
import SiteShell from "@/templates/layout/SiteShell";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const session = await readSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return <SiteShell><AdminCouponsClient /></SiteShell>;
}
