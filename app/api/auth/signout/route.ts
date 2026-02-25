import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  await deleteSession();
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
