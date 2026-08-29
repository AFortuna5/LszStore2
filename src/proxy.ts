import { NextRequest, NextResponse } from "next/server";

import { shouldBlockCrossSiteMutation } from "@/server/security/csrf";

export function proxy(request: NextRequest) {
  const blocked = shouldBlockCrossSiteMutation({
    method: request.method,
    pathname: request.nextUrl.pathname,
    cookieHeader: request.headers.get("cookie"),
    origin: request.headers.get("origin"),
    requestOrigin: request.nextUrl.origin,
  });

  if (blocked) {
    return NextResponse.json({ error: "Origem da requisicao nao autorizada" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
