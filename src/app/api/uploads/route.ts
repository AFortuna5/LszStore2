import { jsonError } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { env } from "@/server/config/env";

export async function POST(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
  if (!env.cloudinaryName || !env.cloudinaryKey || !env.cloudinarySecret) return jsonError("Configure as credenciais do Cloudinary", 503);
  const input = await req.formData();
  const file = input.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return jsonError("Envie uma imagem de ate 8 MB");
  const form = new FormData(); form.set("file", file); form.set("folder", "lsz-store/products");
  const auth = Buffer.from(`${env.cloudinaryKey}:${env.cloudinarySecret}`).toString("base64");
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryName}/image/upload`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: form });
  const result = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) return jsonError(result.error?.message ?? "Falha no upload", 502);
  return Response.json({ url: result.secure_url }, { status: 201 });
}
