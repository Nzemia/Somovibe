import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      // OLD: return NextResponse.json({ error: "Email and password required" }, { status: 400 });
      return NextResponse.json({ error: "Please enter both email and password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user?.password) {
      // OLD: return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      return NextResponse.json({ error: "Email or password is incorrect. Please try again" }, { status: 401 });
    }

    const valid = await compare(String(password), user.password);
    if (!valid) {
      // OLD: return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      return NextResponse.json({ error: "Email or password is incorrect. Please try again" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error("Login error:", e);
    // OLD: return NextResponse.json({ error: "Login failed" }, { status: 500 });
    return NextResponse.json({ error: "Something went wrong. Please try again" }, { status: 500 });
  }
}
