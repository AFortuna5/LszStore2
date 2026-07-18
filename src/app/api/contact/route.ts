import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { prisma } from "@/server/database/client";
import { escapeHtml, sendEmail } from "@/server/services/email";
import { env } from "@/server/config/env";
import { getClientIp, rateLimit } from "@/server/security/rate-limit";

export async function POST(req: Request) {
  const limit = await rateLimit(`contact:${getClientIp(req)}`, 5, 10 * 60_000);
  if (!limit.allowed) return jsonError("Muitas mensagens. Tente novamente mais tarde.", 429);
  const body = await readJson(req);
  if (!isRecord(body)) return jsonError("Dados invalidos");
  for (const field of ["name", "email", "subject", "message"] as const) if (!isNonEmptyString(body[field])) return jsonError("Preencha todos os campos");
  if (!String(body.email).includes("@")) return jsonError("Email invalido");
  const message = await prisma.contactMessage.create({ data: {
    name: String(body.name).trim(), email: String(body.email).trim().toLowerCase(),
    subject: String(body.subject).trim(), message: String(body.message).trim(),
  } });
  void sendEmail({ to: env.supportEmail, subject: `[Contato] ${message.subject}`, idempotencyKey: `contact-${message.id}`, html: `<p><strong>${escapeHtml(message.name)}</strong> (${escapeHtml(message.email)})</p><p>${escapeHtml(message.message).replace(/\n/g, "<br>")}</p>` }).catch(console.error);
  return Response.json({ ok: true }, { status: 201 });
}
