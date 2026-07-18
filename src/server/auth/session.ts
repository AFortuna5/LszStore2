import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

import { prisma } from "@/server/database/client";

export const AUTH_COOKIE_NAME = "lsz-session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type SessionPayload = SessionUser & {
  exp: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("AUTH_SECRET deve possuir pelo menos 32 caracteres em producao");
  }
  return secret ?? "lsz-store-dev-secret-apenas-desenvolvimento";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [salt, hash] = storedPassword.split(":");
  if (!salt || !hash) return false;

  const nextHash = scryptSync(password, salt, 64).toString("hex");
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(nextHash, "hex");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export function readSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const token = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(`${AUTH_COOKIE_NAME}=`.length);

  return verifySessionToken(token);
}

export async function readSessionFromCookies() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !verifyPassword(password, user.password)) {
    return null;
  }

  return user;
}

export async function registerUser({
  name,
  email,
  password,
  role = "USER",
}: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      role,
    },
  });

  return user;
}

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;
