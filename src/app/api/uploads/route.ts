import { jsonError } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { AllowedImageType, sanitizeUploadedImage } from "@/server/security/images";
import { rateLimit } from "@/server/security/rate-limit";

const maxUploadSize = 4 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
  if (!(await rateLimit(`upload:${session.id}`, 20, 15 * 60_000)).allowed) {
    return jsonError("Muitos uploads. Aguarde alguns minutos.", 429);
  }
  const input = await req.formData();
  const file = input.get("file");
  if (!(file instanceof File) || !allowedImageTypes.has(file.type) || file.size > maxUploadSize) {
    return jsonError("Envie uma imagem PNG, JPG ou WEBP de ate 4 MB");
  }

  let sanitized: Uint8Array;
  try {
    sanitized = await sanitizeUploadedImage(new Uint8Array(await file.arrayBuffer()), file.type as AllowedImageType);
  } catch {
    return jsonError("O arquivo enviado nao e uma imagem valida");
  }
  if (sanitized.byteLength > maxUploadSize) return jsonError("A imagem processada excede 4 MB");
  const sanitizedBuffer = Uint8Array.from(sanitized).buffer as ArrayBuffer;

  if (env.cloudinaryName && env.cloudinaryKey && env.cloudinarySecret) {
    const form = new FormData();
    form.set("file", new Blob([sanitizedBuffer], { type: file.type }), file.name);
    form.set("folder", "lsz-store/products");
    const auth = Buffer.from(`${env.cloudinaryKey}:${env.cloudinarySecret}`).toString("base64");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryName}/image/upload`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: form,
    });
    const result = await response.json() as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) return jsonError(result.error?.message ?? "Falha no upload", 502);
    return Response.json({ url: result.secure_url }, { status: 201 });
  }

  const uploadedImage = await prisma.uploadedImage.create({
    data: {
      mimeType: file.type,
      data: new Uint8Array(sanitizedBuffer),
      size: sanitized.byteLength,
    },
    select: { id: true },
  });

  return Response.json({ url: `/api/uploads/${uploadedImage.id}` }, { status: 201 });
}
