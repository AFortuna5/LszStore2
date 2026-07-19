import { jsonError } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const image = await prisma.uploadedImage.findUnique({
    where: { id },
    select: { data: true, mimeType: true, size: true },
  });

  if (!image) return jsonError("Imagem nao encontrada", 404);

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.size),
      "Content-Type": image.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(req: Request, context: RouteContext) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);

  const { id } = await context.params;
  const image = await prisma.uploadedImage.findUnique({ where: { id }, select: { id: true } });
  if (!image) return jsonError("Imagem nao encontrada", 404);

  await prisma.uploadedImage.delete({ where: { id } });
  return Response.json({ ok: true });
}
