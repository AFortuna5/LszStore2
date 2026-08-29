import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("image upload security", () => {
  it("rejeita conteudo cuja assinatura nao corresponde ao MIME informado", async () => {
    const { hasValidImageSignature } = await import("../src/server/security/images");
    const fake = new TextEncoder().encode("<script>alert(1)</script>");
    expect(hasValidImageSignature(fake, "image/png")).toBe(false);
    expect(hasValidImageSignature(fake, "image/jpeg")).toBe(false);
    expect(hasValidImageSignature(fake, "image/webp")).toBe(false);
  });

  it("reprocessa uma imagem valida e preserva um formato seguro", async () => {
    const { hasValidImageSignature, sanitizeUploadedImage } = await import("../src/server/security/images");
    const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
    const sanitized = await sanitizeUploadedImage(png, "image/png");
    expect(hasValidImageSignature(sanitized, "image/png")).toBe(true);
    expect(sanitized.byteLength).toBeGreaterThan(20);
  });
});
