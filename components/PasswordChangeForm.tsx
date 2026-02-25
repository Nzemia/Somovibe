"use client";

import { useState } from "react";
import { toast } from "sonner";

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50 hover:bg-white transition-colors pr-11";

function PasswordInput({
    id, label, value, onChange, placeholder, hint, disabled,
}: {
    id: string; label: string; value: string;
    onChange: (v: string) => void; placeholder: string;
    hint?: string; disabled: boolean;
}) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                    className={inputCls}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                >
                    {show ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
            {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
        </div>
    );
}

export default function PasswordChangeForm() {
    const [current,  setCurrent]  = useState("");
    const [next,     setNext]     = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [isLoading, setLoading] = useState(false);

    const matchOk  = next.length > 0 && confirm.length > 0 && next === confirm;
    const matchBad = next.length > 0 && confirm.length > 0 && next !== confirm;
    const anyFilled = current || next || confirm;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!current || !next || !confirm) { toast.error("Please fill in all password fields"); return; }
        if (next.length < 6)              { toast.error("New password must be at least 6 characters"); return; }
        if (next !== confirm)             { toast.error("New passwords do not match"); return; }
        if (current === next)             { toast.error("New password must differ from current password"); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: next }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update password");
            toast.success("Password updated successfully");
            setCurrent(""); setNext(""); setConfirm("");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => { setCurrent(""); setNext(""); setConfirm(""); };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
                id="current-password" label="Current Password"
                value={current} onChange={setCurrent}
                placeholder="Enter your current password"
                disabled={isLoading}
            />

            <PasswordInput
                id="new-password" label="New Password"
                value={next} onChange={setNext}
                placeholder="Enter your new password"
                hint="Must be at least 6 characters"
                disabled={isLoading}
            />

            <div>
                <PasswordInput
                    id="confirm-password" label="Confirm New Password"
                    value={confirm} onChange={setConfirm}
                    placeholder="Re-enter your new password"
                    disabled={isLoading}
                />
                {matchBad && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Passwords don&apos;t match
                    </p>
                )}
                {matchOk && (
                    <p className="flex items-center gap-1.5 text-xs text-[#008c43] mt-1.5 font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Passwords match
                    </p>
                )}
            </div>

            {/* Security tips */}
            <div className="bg-[#f0faf5] border border-[#d1e8dc] rounded-2xl p-4">
                <p className="text-sm font-bold text-[#006832] mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security tips
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Use a mix of letters, numbers and symbols</li>
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Never share your password with anyone</li>
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Change your password regularly for added security</li>
                </ul>
            </div>

            <div className="flex gap-3 pt-1">
                <button
                    type="submit"
                    disabled={isLoading || !anyFilled || matchBad}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#008c43]/20"
                    style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
                >
                    {isLoading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Updating…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Update Password
                        </>
                    )}
                </button>
                {anyFilled && (
                    <button
                        type="button"
                        onClick={handleCancel}
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
