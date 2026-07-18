import "server-only";

import { env } from "@/server/config/env";

export async function sendEmail({
  to, subject, html, idempotencyKey,
}: { to: string; subject: string; html: string; idempotencyKey?: string }) {
  if (!env.resendKey) return { sent: false, reason: "RESEND_API_KEY nao configurada" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html }),
  });
  if (!response.ok) throw new Error("Falha ao enviar email transacional");
  return { sent: true, data: await response.json() };
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}
