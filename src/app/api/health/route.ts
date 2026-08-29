import { prisma } from "@/server/database/client";

export async function GET() {
  try {
    await prisma.user.count();
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "error" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
