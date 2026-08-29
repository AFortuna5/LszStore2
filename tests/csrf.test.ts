import { describe, expect, it } from "vitest";

import { shouldBlockCrossSiteMutation } from "../src/server/security/csrf";

const base = {
  method: "POST",
  pathname: "/api/orders",
  cookieHeader: "lsz-session=valid-session",
  origin: "https://lszstore2.vercel.app",
  requestOrigin: "https://lszstore2.vercel.app",
};

describe("CSRF protection", () => {
  it("permite mutacao autenticada da mesma origem", () => {
    expect(shouldBlockCrossSiteMutation(base)).toBe(false);
  });

  it("bloqueia mutacao autenticada de outra origem ou sem Origin", () => {
    expect(shouldBlockCrossSiteMutation({ ...base, origin: "https://evil.example" })).toBe(true);
    expect(shouldBlockCrossSiteMutation({ ...base, origin: null })).toBe(true);
  });

  it("mantem o webhook Stripe fora da protecao baseada em cookie", () => {
    expect(shouldBlockCrossSiteMutation({ ...base, pathname: "/api/payments/stripe/webhook", origin: null })).toBe(false);
  });

  it("nao interfere em leitura ou rotas publicas sem sessao", () => {
    expect(shouldBlockCrossSiteMutation({ ...base, method: "GET", origin: null })).toBe(false);
    expect(shouldBlockCrossSiteMutation({ ...base, cookieHeader: null, origin: null })).toBe(false);
  });
});
