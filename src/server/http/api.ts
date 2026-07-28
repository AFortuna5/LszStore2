import "server-only";

import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function toPositiveInt(value: unknown, fallback?: number) {
  const numberValue =
    typeof value === "string" || typeof value === "number"
      ? Number(value)
      : Number.NaN;

  if (!Number.isInteger(numberValue) || numberValue <= 0) return fallback;
  return numberValue;
}

export function toNonNegativeNumber(value: unknown) {
  const numberValue =
    typeof value === "string" || typeof value === "number"
      ? Number(value)
      : Number.NaN;

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
}

export function toBooleanParam(value: string | null) {
  if (value === null) return undefined;
  if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
  if (["false", "0", "no"].includes(value.toLowerCase())) return false;
  return undefined;
}

export function normalizeImages(value: unknown) {
  if (Array.isArray(value)) {
    const images = value
      .filter(isNonEmptyString)
      .map((image) => image.trim())
      .filter(isValidImageSource);
    return images.length > 0 ? images.join(",") : null;
  }

  if (!isNonEmptyString(value)) return null;
  const images = value
    .split(/[,|]/g)
    .map((image) => image.trim())
    .filter(isValidImageSource);
  return images.length > 0 ? images.join(",") : null;
}

function isValidImageSource(value: string) {
  return value.startsWith("/") || /^https:\/\//i.test(value);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
