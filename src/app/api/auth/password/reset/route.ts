import { createHash } from "crypto";
import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { hashPassword } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.token) || !isNonEmptyString(body.password) || body.password.length < 8) return jsonError("Token invalido ou senha muito curta");
  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  const token = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!token || token.usedAt || token.expiresAt < new Date()) return jsonError("Link invalido ou expirado", 400);
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { password: hashPassword(body.password) } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
  return Response.json({ ok: true });
}
