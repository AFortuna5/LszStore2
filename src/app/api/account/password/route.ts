import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { hashPassword, readSessionFromRequest, verifyPassword } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

export async function PATCH(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autenticado", 401);

    const body = await readJson(req);
    if (!isRecord(body)) return jsonError("JSON invalido");
    if (!isNonEmptyString(body.currentPassword)) return jsonError("Informe a senha atual");
    if (!isNonEmptyString(body.newPassword) || body.newPassword.length < 6) {
      return jsonError("A nova senha deve ter pelo menos 6 caracteres");
    }
    if (body.currentPassword === body.newPassword) {
      return jsonError("Escolha uma senha diferente da atual");
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !verifyPassword(body.currentPassword, user.password)) {
      return jsonError("Senha atual incorreta", 401);
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashPassword(body.newPassword) },
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao alterar a senha", 500);
  }
}
