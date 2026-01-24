import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/admin")) {
        // later enforce ADMIN role
        return NextResponse.next();
    }

    if (pathname.startsWith("/teacher")) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/student")) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
