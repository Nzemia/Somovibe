import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "questy_session";

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? process.env.SESSION_SECRET ?? "questy-dev-secret-change-in-production"
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let userId: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      userId = typeof payload.sub === "string" ? payload.sub : null;
    } catch {
      // invalid or expired
    }
  }

  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") || path.startsWith("/teacher") || path.startsWith("/student")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
