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
      return NextResponse.json({ error: "Please log in to continue" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "You don't have permission to do that" }, { status: 403 });
    }
    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Account not found. Please check your details" }, { status: 404 });
    }
  }
  return NextResponse.json({ error: "Something went wrong. Please try again" }, { status: 500 });
}
