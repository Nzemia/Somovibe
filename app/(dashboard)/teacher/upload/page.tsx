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

const GRADES = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9",
];

const MATERIAL_TYPES = [
    { value: "PDF",                label: "PDF Document",       accept: ".pdf",           icon: "📄" },
    { value: "PDF_SLIDES",         label: "PDF Slides",         accept: ".pdf",           icon: "📊" },
    { value: "POWERPOINT",         label: "PowerPoint",         accept: ".pptx,.ppt",     icon: "🎯" },
    { value: "CLASS_INSTRUCTIONS", label: "Class Instructions", accept: ".pdf",           icon: "📋" },
    { value: "SCHEME_OF_WORK",     label: "Scheme of Work",     accept: ".pdf,.pptx,.ppt", icon: "📅" },
    { value: "LESSON_PLAN",        label: "Lesson Plan",        accept: ".pdf,.pptx,.ppt", icon: "📝" },
    { value: "EXAM_QUIZ",          label: "Exam / Quiz",        accept: ".pdf,.pptx,.ppt", icon: "✍️" },
];

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50 hover:bg-white transition-colors";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

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

    const getAccept = () => {
        const t = MATERIAL_TYPES.find(t => t.value === formData.materialType);
        return t?.accept ?? ".pdf,.pptx,.ppt";
    };

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
        if (!file) { setError("Please select a file"); return; }
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

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[#008c43] text-sm font-semibold mb-0.5">Teacher Dashboard</p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Upload Material</h1>
                </div>
                <Link href="/teacher" className="flex items-center gap-1.5 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] font-semibold rounded-xl hover:bg-[#f0faf5] transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
            </div>

            {/* Earnings banner */}
            <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #003318 0%, #008c43 100%)" }}>
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-white font-bold text-sm">You earn 75% on every sale</p>
                    <p className="text-white/65 text-xs">Upload once, earn forever while students across Kenya benefit</p>
                </div>
                {earningsPreview > 0 && (
                    <div className="bg-white/15 rounded-xl px-4 py-2 text-center shrink-0">
                        <p className="text-white/70 text-xs">Your cut</p>
                        <p className="text-white font-extrabold text-lg">KES {earningsPreview}</p>
                        <p className="text-white/60 text-xs">per sale</p>
                    </div>
                )}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-[#d1e8dc] p-6 sm:p-8 shadow-sm">

                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Material type */}
                    <div>
                        <label className={labelCls}>Material Type <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {MATERIAL_TYPES.map((t) => (
                                <button
                                    key={t.value} type="button"
                                    onClick={() => { setFormData({ ...formData, materialType: t.value }); setFile(null); }}
                                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                        formData.materialType === t.value
                                            ? "border-[#008c43] bg-[#f0faf5] ring-1 ring-[#008c43]"
                                            : "border-gray-200 hover:border-[#008c43]/40 hover:bg-[#f8fdfb]"
                                    }`}
                                >
                                    <div className="text-xl mb-1.5">{t.icon}</div>
                                    <div className="text-xs font-semibold text-gray-800 leading-snug">{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className={labelCls}>Title <span className="text-red-500">*</span></label>
                        <input id="title" type="text" required placeholder="e.g. Grade 5 Mathematics Revision Notes"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={inputCls} />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className={labelCls}>Description <span className="text-red-500">*</span></label>
                        <textarea id="description" required rows={3} placeholder="Describe what's included in this material…"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={inputCls + " resize-none"} />
                    </div>

                    {/* Subject + Grade */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="subject" className={labelCls}>Subject <span className="text-red-500">*</span></label>
                            <select id="subject" required value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className={inputCls}>
                                <option value="">Select subject</option>
                                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="grade" className={labelCls}>Grade <span className="text-red-500">*</span></label>
                            <select id="grade" required value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className={inputCls}>
                                <option value="">Select grade</option>
                                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className={labelCls}>Price (KES) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">KES</span>
                            <input id="price" type="number" required min="10" max="10000"
                                placeholder="e.g. 100"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className={inputCls + " pl-12"} />
                        </div>
                        {earningsPreview > 0 && (
                            <p className="mt-2 text-xs text-[#008c43] font-semibold flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                You'll earn KES {earningsPreview} per sale (75%)
                            </p>
                        )}
                    </div>

                    {/* File upload */}
                    <div>
                        <label className={labelCls}>File <span className="text-red-500">*</span></label>
                        <input type="file" id="file-upload" accept={getAccept()} onChange={handleFile}
                            className="hidden" disabled={!formData.materialType} />
                        <label htmlFor="file-upload"
                            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
                                !formData.materialType ? "border-gray-200 opacity-50 cursor-not-allowed" :
                                file ? "border-[#008c43] bg-[#f0faf5]" : "border-gray-300 hover:border-[#008c43] hover:bg-[#f8fdfb]"
                            }`}>
                            {file ? (
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-[#008c43]/10 text-[#008c43] flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB · <span className="text-[#008c43]">Click to change</span></p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {formData.materialType ? "Click to upload file" : "Select a material type first"}
                                        </p>
                                        {formData.materialType && (
                                            <p className="text-xs text-gray-400 mt-0.5">{getAccept()} · Max 10 MB</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Thumbnail upload */}
                    <div>
                        <label className={labelCls}>
                            Cover Image <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">Upload a thumbnail — or we'll use a default one based on material type</p>
                        <input type="file" id="thumb-upload" accept="image/*" onChange={handleThumb} className="hidden" />
                        <label htmlFor="thumb-upload"
                            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${
                                thumbnailPreview ? "border-[#008c43] bg-[#f0faf5]" : "border-gray-200 hover:border-[#008c43]/50 hover:bg-[#f8fdfb]"
                            }`}>
                            {thumbnailPreview ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={thumbnailPreview} alt="Thumbnail" className="w-40 h-28 object-cover rounded-xl" />
                                    <p className="text-xs text-gray-500">{thumbnail?.name} · <span className="text-[#008c43]">Click to change</span></p>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">PNG, JPG, WEBP · Max 5 MB</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Info box */}
                    <div className="bg-[#f0faf5] border border-[#d1e8dc] rounded-2xl p-4">
                        <p className="text-sm font-bold text-[#006832] mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Before you upload
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Your material will be reviewed by our admin team</li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Approval typically takes 24–48 hours</li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />Only high-quality, original content will be approved</li>
                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#008c43] mt-1.5 shrink-0" />You&apos;ll be notified once your material is live</li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
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
                                    Upload Material
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => router.back()}
                            className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
