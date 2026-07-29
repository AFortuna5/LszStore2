import SiteShell from "@/templates/layout/SiteShell";
import PaymentStatus from "@/templates/checkout/PaymentStatus";

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  return <SiteShell><PaymentStatus sessionId={sessionId ?? ""} /></SiteShell>;
}
