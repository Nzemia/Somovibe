import { createSupabaseServer } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const supabase = await createSupabaseServer();
        await supabase.auth.signOut();

        // Clear all auth cookies
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        // Clear Supabase auth cookies
        allCookies.forEach(cookie => {
            if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
                cookieStore.delete(cookie.name);
            }
        });

        return NextResponse.json({ success: true, message: "Signed out successfully" });
    } catch (error) {
        console.error("Sign out error:", error);
        return NextResponse.json({ success: false, error: "Failed to sign out" }, { status: 500 });
    }
}
