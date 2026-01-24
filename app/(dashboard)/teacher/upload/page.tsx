"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
];

const GRADES = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
];

export default function UploadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        grade: "",
        price: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setError("Only PDF files are allowed");
                setFile(null);
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size must be less than 10MB");
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a PDF file");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("file", file);
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("subject", formData.subject);
            formDataToSend.append("grade", formData.grade);
            formDataToSend.append("price", formData.price);

            const res = await fetch("/api/pdf/upload", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            router.push("/teacher?upload=success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Upload Learning Material</h1>
                    <p className="text-muted-foreground">
                        Share your teaching resources and earn 75% from every sale
                    </p>
                </div>

                <div className="bg-card border border-border rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Title <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="e.g., Grade 5 Mathematics Revision Notes"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Description <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                                placeholder="Describe what's included in this material..."
                            />
                        </div>

                        {/* Subject and Grade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Subject <span className="text-destructive">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                >
                                    <option value="">Select subject</option>
                                    {SUBJECTS.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Grade <span className="text-destructive">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                >
                                    <option value="">Select grade</option>
                                    {GRADES.map((grade) => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Price (KES) <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="10"
                                max="10000"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                                placeholder="e.g., 50"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                You'll earn 75% (KES {formData.price ? Math.floor(Number(formData.price) * 0.75) : 0}) per sale
                            </p>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                PDF File <span className="text-destructive">*</span>
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    required
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {file ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                Click to upload PDF
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Maximum file size: 10MB
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-accent/50 border border-border rounded-md p-4">
                            <h3 className="font-semibold text-foreground mb-2">Before you upload:</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Your material will be reviewed by our admin team</li>
                                <li>• Approval typically takes 24-48 hours</li>
                                <li>• Only high-quality, original content will be approved</li>
                                <li>• You'll be notified once your material is live</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Uploading..." : "Upload Material"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
