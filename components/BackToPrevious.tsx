"use client"

import { useRouter } from "next/navigation"

export function BackToPrevious({
    fallback,
}: {
    fallback: string
}) {
    const router = useRouter()

    return (
        <button
            type="button"
            onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back()
                    return
                }
                router.push(fallback)
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
        </button>
    )
}
