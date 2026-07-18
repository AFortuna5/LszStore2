import { createHash, randomBytes } from "crypto";
import { isNonEmptyString, isRecord, readJson } from "@/server/http/api";
import { prisma } from "@/server/database/client";
import { env } from "@/server/config/env";
import { sendEmail } from "@/server/services/email";
import { getClientIp, rateLimit } from "@/server/security/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(`forgot:${getClientIp(req)}`, 5, 30 * 60_000).allowed) return Response.json({ ok: true });
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.email)) return Response.json({ ok: true });
  const user = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 30 * 60_000) } });
    void sendEmail({ to: user.email, subject: "Redefinicao de senha", html: `<h1>Redefinir senha</h1><p>Este link expira em 30 minutos.</p><p><a href="${env.appUrl}/recuperar-senha?token=${token}">Criar nova senha</a></p>`, idempotencyKey: `password-reset-${user.id}-${Date.now()}` }).catch(console.error);
  }
  return Response.json({ ok: true });
}
