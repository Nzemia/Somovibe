"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type User = {
    id: string;
    email: string;
    phone: string | null;
};

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50 hover:bg-white transition-colors";

export default function ProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const [phone, setPhone] = useState(user.phone || "");
    const [isLoading, setIsLoading] = useState(false);
    const isDirty = phone !== (user.phone || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/user/phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update phone number");
            }
            toast.success("Phone number updated successfully");
            router.refresh();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update phone number");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email — read only */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                </label>
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-20 py-3 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed select-none truncate"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
                        Locked
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Email address cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    M-Pesa Phone Number
                </label>
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="254712345678"
                        required
                        disabled={isLoading}
                        className={inputCls + " pl-10"}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                    Format: <span className="font-mono">254XXXXXXXXX</span> or <span className="font-mono">07XXXXXXXX</span> — used for M-Pesa withdrawals
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
                <button
                    type="submit"
                    disabled={isLoading || !isDirty}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#008c43]/20"
                    style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
                >
                    {isLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
                {isDirty && (
                    <button
                        type="button"
                        onClick={() => setPhone(user.phone || "")}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        Discard
                    </button>
                )}
            </div>
        </form>
    );
}
