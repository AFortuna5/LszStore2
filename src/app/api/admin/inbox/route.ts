import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

export async function GET(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.newsletterSubscriber.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 500 }),
  ]);
  return Response.json({ messages, subscribers });
}

export async function PATCH(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.id) || !isNonEmptyString(body.status) || !["NEW", "READ", "RESOLVED"].includes(body.status)) return jsonError("Dados invalidos");
  return Response.json(await prisma.contactMessage.update({ where: { id: body.id }, data: { status: body.status } }));
}
