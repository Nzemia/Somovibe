"use client";

import { useState, useMemo } from "react";
import PdfCard from "./PdfCard";
import { MATERIAL_TYPE_CONFIG } from "@/lib/materialTypes";

type Material = {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    price: number;
    materialType: string;
    teacher: { email: string };
};

type Props = {
    materials: Material[];
    purchasedIds: Set<string>;
    user: { id?: string; email: string; role: string; phone?: string | null } | null;
};

const SUBJECTS = [
    "All Subjects",
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
    "All Grades",
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

export default function MarketplaceClient({ materials, purchasedIds, user }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [selectedGrade, setSelectedGrade] = useState("All Grades");

    const filteredMaterials = useMemo(() => {
        console.log("Filtering materials:", {
            total: materials.length,
            selectedType,
            sampleMaterialType: materials[0]?.materialType
        });

        return materials.filter((material) => {
            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                material.subject.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType = selectedType === "ALL" || material.materialType === selectedType;

            // Subject filter
            const matchesSubject =
                selectedSubject === "All Subjects" || material.subject === selectedSubject;

            // Grade filter
            const matchesGrade = selectedGrade === "All Grades" || material.grade === selectedGrade;

            return matchesSearch && matchesType && matchesSubject && matchesGrade;
        });
    }, [materials, searchQuery, selectedType, selectedSubject, selectedGrade]);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search materials by title, description, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            {/* Material Type Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedType("ALL")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === "ALL"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                        }`}
                >
                    All Types
                </button>
                {Object.entries(MATERIAL_TYPE_CONFIG).map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedType(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedType === key
                            ? `${config.color} text-white`
                            : "bg-card border border-border text-foreground hover:bg-accent"
                            }`}
                    >
                        <span>{config.icon}</span>
                        <span className="hidden sm:inline">{config.label}</span>
                    </button>
                ))}
            </div>

            {/* Subject and Grade Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Subject
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    >
                        {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Grade
                    </label>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    >
                        {GRADES.map((grade) => (
                            <option key={grade} value={grade}>
                                {grade}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredMaterials.length} of {materials.length} materials
                </p>
                {(searchQuery || selectedType !== "ALL" || selectedSubject !== "All Subjects" || selectedGrade !== "All Grades") && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedType("ALL");
                            setSelectedSubject("All Subjects");
                            setSelectedGrade("All Grades");
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length === 0 ? (
                <div className="text-center py-16">
                    <svg
                        className="w-16 h-16 mx-auto text-muted-foreground mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No materials found
                    </h3>
                    <p className="text-muted-foreground">
                        Try adjusting your filters or search query
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <PdfCard
                            key={material.id}
                            pdf={material}
                            isPurchased={purchasedIds.has(material.id)}
                            user={user}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
