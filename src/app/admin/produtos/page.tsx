import { redirect } from "next/navigation";

import AdminProductsClient from "@/templates/admin/AdminProductsClient";
import SiteShell from "@/templates/layout/SiteShell";
import { readSessionFromCookies } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await readSessionFromCookies();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <SiteShell>
      <AdminProductsClient />
    </SiteShell>
  );
}
