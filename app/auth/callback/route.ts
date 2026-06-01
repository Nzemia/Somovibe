import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin;
  
  // 1. Get the NextAuth session
  const session = await auth();
  
  if (!session?.user?.email) {
    // Not authenticated, redirect to login
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  // 2. Find the user in the database
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  // Upgrade user to TEACHER if they selected TEACHER during Google registration
  const targetRole = requestUrl.searchParams.get("role");
  if (targetRole === "TEACHER" && user.role === "STUDENT") {
    try {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "TEACHER",
          teacherProfile: {
            upsert: {
              create: { isActive: false },
              update: {} // do nothing if it already exists
            }
          }
        }
      });
    } catch (dbError) {
      console.error("Failed to upgrade user to TEACHER in callback:", dbError);
      // Fallback: continue flow to let user log in, even if upgrade encountered a DB issue
    }
  }

  // 3. Ensure they have the questy_session cookie set
  await createSession(user.id);

  // 4. Handle dynamic callbackUrl redirection if provided, otherwise role-based
  const callbackUrl = requestUrl.searchParams.get("callbackUrl");
  let dest = callbackUrl || "";
  
  // Validate redirect destination safety (relative path only to prevent open redirects)
  if (!dest || !dest.startsWith("/")) {
    dest =
      user.role === "ADMIN" ? "/admin" :
      user.role === "TEACHER" ? "/teacher" :
      "/student";
  }

  return NextResponse.redirect(new URL(dest, baseUrl));
}
