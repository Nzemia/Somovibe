import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
