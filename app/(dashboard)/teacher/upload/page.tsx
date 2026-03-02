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
    "Kindergarten",
   

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
    "Grade 10",
    
];

const MATERIAL_TYPES = [
    { value: "PDF", label: "PDF Document", accept: ".pdf", icon: "📄" },
    { value: "PDF_SLIDES", label: "PDF Slides", accept: ".pdf", icon: "📊" },
    { value: "POWERPOINT", label: "PowerPoint Presentation", accept: ".pptx,.ppt", icon: "🎯" },
    { value: "CLASS_INSTRUCTIONS", label: "Class Instructions", accept: ".pdf", icon: "📋" },
    { value: "SCHEME_OF_WORK", label: "Scheme of Work", accept: ".pdf,.pptx,.ppt", icon: "📅" },
    { value: "LESSON_PLAN", label: "Lesson Plan", accept: ".pdf,.pptx,.ppt", icon: "📝" },
    { value: "EXAM_QUIZ", label: "Exam/Quiz", accept: ".pdf,.pptx,.ppt", icon: "✍️" },
    

];

export default function UploadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        grade: "",
        price: "",
        materialType: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const allowedTypes = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError("Only PDF and PowerPoint files are allowed");
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

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith("image/")) {
                setError("Thumbnail must be an image file");
                setThumbnail(null);
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Thumbnail size must be less than 5MB");
                setThumbnail(null);
                return;
            }
            setThumbnail(selectedFile);
            setThumbnailPreview(URL.createObjectURL(selectedFile));
            setError("");
        }
    };

    const getAcceptedFileTypes = () => {
        if (!formData.materialType) return ".pdf,.pptx,.ppt";
        const materialType = MATERIAL_TYPES.find(t => t.value === formData.materialType);
        return materialType?.accept || ".pdf,.pptx,.ppt";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.materialType) {
            setError("Please select a material type");
            return;
        }

        if (!file) {
            setError("Please select a file");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("file", file);
            if (thumbnail) {
                formDataToSend.append("thumbnail", thumbnail);
            }
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("subject", formData.subject);
            formDataToSend.append("grade", formData.grade);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("materialType", formData.materialType);

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
                        {/* Material Type */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Material Type <span className="text-destructive">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {MATERIAL_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, materialType: type.value });
                                            setFile(null); // Reset file when changing type
                                        }}
                                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.materialType === type.value
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="text-sm font-medium text-foreground">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                File Upload <span className="text-destructive">*</span>
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    accept={getAcceptedFileTypes()}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    required
                                    disabled={!formData.materialType}
                                />
                                <label htmlFor="file-upload" className={formData.materialType ? "cursor-pointer" : "cursor-not-allowed opacity-50"}>
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
                                                {formData.materialType ? "Click to upload file" : "Select material type first"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formData.materialType ? `Accepted: ${getAcceptedFileTypes()} • Max: 10MB` : "Choose a material type above"}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Thumbnail Image (Optional)
                            </label>
                            <p className="text-xs text-muted-foreground mb-3">
                                Upload a custom thumbnail or we'll use a default one based on material type
                            </p>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                    id="thumbnail-upload"
                                />
                                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                                    {thumbnailPreview ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="w-48 h-32 object-cover rounded-lg"
                                            />
                                            <p className="text-sm font-medium text-foreground">{thumbnail?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {thumbnail && (thumbnail.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm font-medium text-foreground mb-1">
                                                Click to upload thumbnail
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, WEBP • Max: 5MB
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
