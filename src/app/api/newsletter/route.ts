import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { prisma } from "@/server/database/client";
import { getClientIp, rateLimit } from "@/server/security/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(`newsletter:${getClientIp(req)}`, 10, 60_000).allowed) return jsonError("Tente novamente mais tarde", 429);
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.email) || !body.email.includes("@")) return jsonError("Email invalido");
  await prisma.newsletterSubscriber.upsert({
    where: { email: body.email.trim().toLowerCase() },
    update: { active: true, unsubscribedAt: null },
    create: { email: body.email.trim().toLowerCase() },
  });
  return Response.json({ ok: true }, { status: 201 });
}
