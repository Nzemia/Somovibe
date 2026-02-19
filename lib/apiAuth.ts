import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

export async function requireRole(role: "ADMIN" | "TEACHER" | "STUDENT") {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
