const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type MutationRequest = {
  method: string;
  pathname: string;
  cookieHeader: string | null;
  origin: string | null;
  requestOrigin: string;
};

export function shouldBlockCrossSiteMutation(request: MutationRequest) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return false;
  if (request.pathname === "/api/payments/stripe/webhook") return false;

  const hasSession = request.cookieHeader
    ?.split(";")
    .some((entry) => entry.trim().startsWith("lsz-session=")) ?? false;

  if (!hasSession) return false;
  return !request.origin || request.origin !== request.requestOrigin;
}
