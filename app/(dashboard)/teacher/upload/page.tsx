"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUBJECTS = [
    "Mathematics", "English", "Kiswahili", "Science",
    "Social Studies", "Religious Education", "Creative Arts",
    "Agriculture", "Home Science", "Business Studies",
    "Geography", "History", "Music", "Physical Education", "ICT",
];

const PRICE_PRESETS = [50, 100, 150, 200, 300, 500];

const MATERIAL_TYPES = [
    {
        value: "PDF",
        label: "PDF Document",
        accept: ".pdf",
        desc: "Notes, summaries",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="8" y="4" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M22 4v7h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M13 17h10M13 21h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "PDF_SLIDES",
        label: "PDF Slides",
        accept: ".pdf",
        desc: "Presentation slides",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="5" y="8" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M16 26l-2 5M20 26v5M24 26l2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 31h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 14l4 4 3-3 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        value: "POWERPOINT",
        label: "PowerPoint",
        accept: ".pptx,.ppt",
        desc: "PPT presentations",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="5" y="6" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M18 26v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="18" cy="15" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M18 15l5-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 10v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        value: "CLASS_INSTRUCTIONS",
        label: "Class Instructions",
        accept: ".pdf",
        desc: "Classroom guides",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="10" y="6" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
                <path d="M15 17l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 23l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        value: "SCHEME_OF_WORK",
        label: "Scheme of Work",
        accept: ".pdf,.pptx,.ppt",
        desc: "Term planners",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="6" y="8" width="28" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 4v8M26 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 18h28" stroke="currentColor" strokeWidth="2" />
                <path d="M6 24h28M6 30h28" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18 18v16M26 18v16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        value: "LESSON_PLAN",
        label: "Lesson Plan",
        accept: ".pdf,.pptx,.ppt",
        desc: "Detailed plans",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="7" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 5h4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M12 13h11M12 18h11M12 23h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M27 24l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="25" cy="22" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
    },
    {
        value: "EXAM_QUIZ",
        label: "Exam / Quiz",
        accept: ".pdf,.pptx,.ppt",
        desc: "Tests & assessments",
        icon: (
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M13 13h10M13 18h10M13 23h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 25l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 25l2 5-2-1-2 1 2-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
];

function SectionLabel({ num, label, done }: { num: number; label: string; done?: boolean }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                done ? "bg-[#008c43] text-white" : "bg-[#f0faf5] text-[#008c43] border-2 border-[#008c43]"
            }`}>
                {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : num}
            </div>
            <h2 className="text-base font-bold text-gray-900">{label}</h2>
        </div>
    );
}

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50 hover:bg-white transition-colors";

export default function UploadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [formData, setFormData] = useState({
        title: "", description: "", subject: "", grade: "", price: "", materialType: "",
    });

    const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));

    const getAccept = () => MATERIAL_TYPES.find(t => t.value === formData.materialType)?.accept ?? ".pdf,.pptx,.ppt";

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const allowed = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
        if (!allowed.includes(f.type)) { setError("Only PDF and PowerPoint files are allowed"); setFile(null); return; }
        if (f.size > 10 * 1024 * 1024) { setError("File must be under 10 MB"); setFile(null); return; }
        setFile(f); setError("");
    };

    const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) { setError("Thumbnail must be an image"); setThumbnail(null); return; }
        if (f.size > 5 * 1024 * 1024) { setError("Thumbnail must be under 5 MB"); setThumbnail(null); return; }
        setThumbnail(f); setThumbnailPreview(URL.createObjectURL(f)); setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.materialType) { setError("Please select a material type"); return; }
        if (!file) { setError("Please select a file to upload"); return; }
        setError(""); setLoading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            if (thumbnail) fd.append("thumbnail", thumbnail);
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            const res = await fetch("/api/pdf/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            router.push("/teacher?upload=success");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const earningsPreview = formData.price ? Math.floor(Number(formData.price) * 0.75) : 0;

    const sectionDone = {
        type: !!formData.materialType,
        details: !!(formData.title && formData.description),
        target: !!(formData.subject && formData.grade),
        price: !!formData.price,
        file: !!file,
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-xs font-semibold uppercase tracking-widest mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Upload Material</h1>
                </div>
                <Link href="/teacher" className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Step 1: Material Type ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <SectionLabel num={1} label="What type of material is this?" done={sectionDone.type} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {MATERIAL_TYPES.map((t) => {
                            const active = formData.materialType === t.value;
                            return (
                                <button
                                    key={t.value} type="button"
                                    onClick={() => { set("materialType", t.value); setFile(null); }}
                                    className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                                        active
                                            ? "border-[#008c43] bg-[#f0faf5] shadow-sm"
                                            : "border-gray-100 hover:border-[#008c43]/40 hover:bg-[#f8fdfb] bg-gray-50"
                                    }`}
                                >
                                    <div className={`transition-colors ${active ? "text-[#008c43]" : "text-gray-400 group-hover:text-[#008c43]"}`}>
                                        {t.icon}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold leading-snug ${active ? "text-[#006832]" : "text-gray-700"}`}>{t.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                                    </div>
                                    {active && (
                                        <div className="w-5 h-5 rounded-full bg-[#008c43] flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Step 2: Title & Description ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <SectionLabel num={2} label="Give it a title and description" done={sectionDone.details} />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input id="title" type="text" required
                                placeholder="e.g. Grade 5 Mathematics Revision Notes"
                                value={formData.title}
                                onChange={(e) => set("title", e.target.value)}
                                className={inputCls} />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea id="description" required rows={3}
                                placeholder="What's inside? Topics covered, level of difficulty, who it's for…"
                                value={formData.description}
                                onChange={(e) => set("description", e.target.value)}
                                className={inputCls + " resize-none"} />
                        </div>
                    </div>
                </div>

                {/* ── Step 3: Subject & Grade ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <SectionLabel num={3} label="Subject & Grade" done={sectionDone.target} />

                    {/* Subject pills */}
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Subject <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SUBJECTS.map((s) => {
                                const active = formData.subject === s;
                                return (
                                    <button key={s} type="button"
                                        onClick={() => set("subject", s)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                                            active
                                                ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#008c43]/50 hover:text-[#008c43]"
                                        }`}>
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Grade pills */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Grade <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[1,2,3,4,5,6,7,8,9].map((g) => {
                                const val = `Grade ${g}`;
                                const active = formData.grade === val;
                                return (
                                    <button key={g} type="button"
                                        onClick={() => set("grade", val)}
                                        className={`w-12 h-12 rounded-2xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center gap-0 ${
                                            active
                                                ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-[#008c43]/50 hover:text-[#008c43]"
                                        }`}>
                                        <span className="text-[10px] font-semibold leading-none opacity-60">Gr.</span>
                                        <span className="text-base font-extrabold leading-none">{g}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Step 4: Pricing ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <SectionLabel num={4} label="Set your price" done={sectionDone.price} />

                    {/* Quick presets */}
                    <p className="text-xs text-gray-500 mb-3">Quick pick or type a custom amount</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {PRICE_PRESETS.map((p) => {
                            const active = formData.price === String(p);
                            return (
                                <button key={p} type="button"
                                    onClick={() => set("price", String(p))}
                                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                                        active
                                            ? "bg-[#008c43] border-[#008c43] text-white shadow-sm"
                                            : "bg-gray-50 border-gray-200 text-gray-700 hover:border-[#008c43]/50"
                                    }`}>
                                    KES {p}
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm pointer-events-none">KES</span>
                        <input id="price" type="number" required min="10" max="10000"
                            placeholder="Custom amount"
                            value={formData.price}
                            onChange={(e) => set("price", e.target.value)}
                            className={inputCls + " pl-[3.25rem]"} />
                    </div>

                    {earningsPreview > 0 && (
                        <div className="mt-3 flex items-center gap-3 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl px-4 py-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#008c43]/10 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Your earnings per sale</p>
                                <p className="text-base font-extrabold text-[#008c43]">KES {earningsPreview} <span className="text-xs font-normal text-gray-500">(75% of KES {formData.price})</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Step 5: File Upload ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <SectionLabel num={5} label="Upload your file" done={sectionDone.file} />

                    <input type="file" id="file-upload" accept={getAccept()} onChange={handleFile}
                        className="hidden" disabled={!formData.materialType} />
                    <label htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-6 transition-all cursor-pointer ${
                            !formData.materialType
                                ? "border-gray-200 opacity-50 cursor-not-allowed"
                                : file
                                    ? "border-[#008c43] bg-[#f0faf5]"
                                    : "border-gray-200 hover:border-[#008c43] hover:bg-[#f8fdfb]"
                        }`}>
                        {file ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-[#008c43] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp;
                                        <span className="text-[#008c43] font-semibold">Click to change</span>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.materialType ? "bg-[#f0faf5] text-[#008c43]" : "bg-gray-100 text-gray-300"}`}>
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className={`text-sm font-bold ${formData.materialType ? "text-gray-800" : "text-gray-400"}`}>
                                        {formData.materialType ? "Tap to choose your file" : "Select a material type first"}
                                    </p>
                                    {formData.materialType && (
                                        <p className="text-xs text-gray-400 mt-1">{getAccept()} &nbsp;·&nbsp; Max 10 MB</p>
                                    )}
                                </div>
                            </>
                        )}
                    </label>
                </div>

                {/* ── Step 6: Cover Image (optional) ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-extrabold shrink-0">6</div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 leading-none">Cover Image</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Optional — we&apos;ll use a default if you skip</p>
                            </div>
                        </div>
                        {thumbnailPreview && (
                            <button type="button" onClick={() => { setThumbnail(null); setThumbnailPreview(""); }}
                                className="text-xs text-red-500 font-semibold hover:text-red-700">Remove</button>
                        )}
                    </div>

                    <input type="file" id="thumb-upload" accept="image/*" onChange={handleThumb} className="hidden" />
                    <label htmlFor="thumb-upload"
                        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-8 px-6 transition-all cursor-pointer ${
                            thumbnailPreview ? "border-[#008c43] bg-[#f0faf5]" : "border-gray-200 hover:border-[#008c43]/50 hover:bg-[#f8fdfb]"
                        }`}>
                        {thumbnailPreview ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={thumbnailPreview} alt="Cover preview" className="w-44 h-28 object-cover rounded-xl shadow" />
                                <p className="text-xs text-gray-500">{thumbnail?.name} &nbsp;·&nbsp; <span className="text-[#008c43] font-semibold">Click to change</span></p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">PNG, JPG, WEBP &nbsp;·&nbsp; Max 5 MB</p>
                            </>
                        )}
                    </label>
                </div>

                {/* ── Review & Submit ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Ready to submit?</h2>

                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                        {[
                            { label: "Material type", done: sectionDone.type },
                            { label: "Title & description", done: sectionDone.details },
                            { label: "Subject & grade", done: sectionDone.target },
                            { label: "Price set", done: sectionDone.price },
                            { label: "File attached", done: sectionDone.file },
                        ].map((item) => (
                            <div key={item.label} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${
                                item.done ? "bg-[#f0faf5] text-[#006832]" : "bg-gray-50 text-gray-400"
                            }`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                    item.done ? "bg-[#008c43]" : "bg-gray-200"
                                }`}>
                                    {item.done ? (
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    )}
                                </div>
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="bg-[#f0faf5] border border-[#d1e8dc] rounded-xl px-4 py-3 mb-5 text-xs text-gray-600 space-y-1">
                        <p className="font-bold text-[#006832] mb-1.5">After you submit:</p>
                        <p>• Our team will review your material within 24–48 hours</p>
                        <p>• Only high-quality, original content is approved</p>
                        <p>• You&apos;ll be notified once your material goes live</p>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#008c43]/20"
                            style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}>
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    Submit Material
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => router.back()}
                            className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
