"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUBJECTS = [
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "Religious Education",
    "Creative Arts",
    "Agriculture",
    "Home Science",
    "Business Studies",
    "Computer Studies",
];

const GRADES = [
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
];

const PRICE_PRESETS = [50, 100, 200, 500, 1000];

const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50 hover:bg-white transition-colors";

interface Material {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    grade: string;
    price: number;
}

export default function EditMaterialForm({ material }: { material: Material }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: material.title,
        description: material.description || "",
        subject: material.subject,
        grade: material.grade,
        price: material.price.toString(),
    });

    const set = (key: string, val: string) =>
        setFormData((p) => ({ ...p, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.subject || !formData.grade || !formData.price) {
            setError("All fields are required");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append("id", material.id);
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("subject", formData.subject);
            fd.append("grade", formData.grade);
            fd.append("price", formData.price);

            const res = await fetch("/api/teacher/material/update", {
                method: "PUT",
                body: fd,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update material");
            }

            router.push("/teacher?upload=updated");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const earningsPreview = formData.price
        ? Math.floor(Number(formData.price) * 0.75)
        : 0;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">
                        Teacher Dashboard
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Edit Material
                    </h1>
                </div>
                <Link
                    href="/teacher"
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">
                    <svg
                        className="w-5 h-5 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title & Description */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">
                        Title & Description
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-semibold text-gray-700 mb-1.5"
                            >
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                placeholder="e.g. Grade 5 Mathematics Revision Notes"
                                value={formData.title}
                                onChange={(e) => set("title", e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-semibold text-gray-700 mb-1.5"
                            >
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                required
                                rows={3}
                                placeholder="What's inside? Topics covered, level of difficulty, who it's for…"
                                value={formData.description}
                                onChange={(e) => set("description", e.target.value)}
                                className={inputCls + " resize-none"}
                            />
                        </div>
                    </div>
                </div>

                {/* Subject & Grade */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">
                        Subject & Grade
                    </h2>

                    {/* Subject pills */}
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Subject <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {SUBJECTS.map((s) => {
                                const active = formData.subject === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => set("subject", s)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${active
                                                ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#008c43]/50 hover:text-[#008c43]"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                        <input
                            type="text"
                            placeholder="Or type your subject"
                            value={formData.subject || ""}
                            onChange={(e) => set("subject", e.target.value)}
                            className="px-3 py-2 border rounded-xl text-sm w-full"
                        />
                    </div>

                    {/* Grade pills */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Grade <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {GRADES.map((g) => {
                                const active = formData.grade === g;
                                return (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => set("grade", g)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${active
                                                ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#008c43]/50 hover:text-[#008c43]"
                                            }`}
                                    >
                                        {g}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">
                        Set your price
                    </h2>

                    <p className="text-xs text-gray-500 mb-3">
                        Quick pick or type a custom amount
                    </p>

                    {PRICE_PRESETS?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {PRICE_PRESETS.map((p) => {
                                const active = formData.price === String(p);
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => set("price", String(p))}
                                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${active
                                                ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-700 hover:border-[#008c43]/50"
                                            }`}
                                    >
                                        KES {p}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">
                            KES
                        </span>
                        <input
                            id="price"
                            type="number"
                            required
                            min={10}
                            max={10000}
                            placeholder="Custom amount"
                            value={formData.price || ""}
                            onChange={(e) => set("price", e.target.value)}
                            className={inputCls + " pl-[3.25rem]"}
                        />
                    </div>

                    {earningsPreview > 0 && (
                        <div className="mt-3 flex items-center gap-3 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl px-4 py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#008c43]/10 flex items-center justify-center shrink-0">
                                <svg
                                    className="w-4 h-4 text-[#008c43]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Your earnings per sale</p>
                                <p className="text-base font-extrabold text-[#008c43]">
                                    KES {earningsPreview}{" "}
                                    <span className="text-xs font-normal text-gray-500">
                                        (75% of KES {formData.price})
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex gap-3">
                        <Link
                            href="/teacher"
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#008c43]/20"
                            style={{
                                background:
                                    "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)",
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Updating…
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}
