import { prisma } from "@/server/database/client";

export async function GET() {
  try {
    await prisma.user.count();
    return Response.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
