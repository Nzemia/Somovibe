"use client";

import { useState, useMemo } from "react";
import PdfCard from "./PdfCard";
import { MATERIAL_TYPE_CONFIG } from "@/lib/materialTypes";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Material = {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    price: number;
    materialType: string;
    thumbnailUrl: string | null;
    teacher: { id: string; email: string };
    _count: { downloads: number; reviews: number };
    reviews: { rating: number }[];
};

type Props = {
    materials: Material[];
    purchasedIds: Set<string>;
    user: { id?: string; email: string; role: string; phone?: string | null } | null;
    highlightMaterialId?: string;
    filterTeacherId?: string;
};

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

const GRADE_GROUPS = [
    { label: "Grades 1-3", values: ["Grade 1", "Grade 2", "Grade 3"] },
    { label: "Grades 4-6", values: ["Grade 4", "Grade 5", "Grade 6"] },
    { label: "Grades 7-9", values: ["Grade 7", "Grade 8", "Grade 9"] },
];

const ITEMS_PER_PAGE = 16;

export default function MarketplaceClient({ materials, purchasedIds, user, highlightMaterialId, filterTeacherId }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredMaterials = useMemo(() => {
        return materials.filter((material) => {
            // Teacher filter (if coming from teacher profile link)
            if (filterTeacherId && material.teacher.id !== filterTeacherId) {
                return false;
            }

            // Search filter
            const matchesSearch =
                searchQuery === "" ||
                material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                material.subject.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType =
                selectedTypes.length === 0 || selectedTypes.includes(material.materialType);

            // Subject filter
            const matchesSubject =
                selectedSubjects.length === 0 || selectedSubjects.includes(material.subject);

            // Grade filter
            const matchesGrade =
                selectedGrades.length === 0 || selectedGrades.includes(material.grade);

            // Price filter
            const matchesPrice =
                (priceRange.min === "" || material.price >= Number(priceRange.min)) &&
                (priceRange.max === "" || material.price <= Number(priceRange.max));

            return matchesSearch && matchesType && matchesSubject && matchesGrade && matchesPrice;
        });
    }, [materials, searchQuery, selectedTypes, selectedSubjects, selectedGrades, priceRange, filterTeacherId]);

    // Pagination
    const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
    const paginatedMaterials = filteredMaterials.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
        setCurrentPage(1);
    };

    const toggleSubject = (subject: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
        );
        setCurrentPage(1);
    };

    const toggleGrade = (grade: string) => {
        setSelectedGrades((prev) =>
            prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSelectedSubjects([]);
        setSelectedGrades([]);
        setPriceRange({ min: "", max: "" });
        setVerifiedOnly(false);
        setSearchQuery("");
        setCurrentPage(1);
    };

    const hasActiveFilters =
        selectedTypes.length > 0 ||
        selectedSubjects.length > 0 ||
        selectedGrades.length > 0 ||
        priceRange.min !== "" ||
        priceRange.max !== "" ||
        verifiedOnly ||
        searchQuery !== "";

    return (
        <div className="flex gap-8 lg:gap-12">
            {/* Sticky Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0 ml-4">
                <div className="sticky top-4 space-y-6">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-primary hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Grade Filter */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Grade</h3>
                        {GRADE_GROUPS.map((group) => (
                            <label key={group.label} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={group.values.every((g) => selectedGrades.includes(g))}
                                    onChange={() => {
                                        const allSelected = group.values.every((g) =>
                                            selectedGrades.includes(g)
                                        );
                                        if (allSelected) {
                                            setSelectedGrades((prev) =>
                                                prev.filter((g) => !group.values.includes(g))
                                            );
                                        } else {
                                            setSelectedGrades((prev) => [
                                                ...prev.filter((g) => !group.values.includes(g)),
                                                ...group.values,
                                            ]);
                                        }
                                        setCurrentPage(1);
                                    }}
                                    className="w-4 h-4 rounded border-input"
                                />
                                <span className="text-sm text-muted-foreground">{group.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Subject Filter */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Subject</h3>
                        <div className="space-y-2">
                            {SUBJECTS.map((subject) => (
                                <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(subject)}
                                        onChange={() => toggleSubject(subject)}
                                        className="w-4 h-4 rounded border-input"
                                    />
                                    <span className="text-sm text-muted-foreground">{subject}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">Price range (KES)</h3>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => {
                                    setPriceRange({ ...priceRange, min: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => {
                                    setPriceRange({ ...priceRange, max: e.target.value });
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    {/* Verified Only Toggle */}
                    {/* <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <h3 className="text-sm font-medium text-foreground">Verified only</h3>
                                <p className="text-xs text-muted-foreground">
                                    Show materials from verified teachers only
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => {
                                    setVerifiedOnly(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="w-10 h-6 rounded-full"
                            />
                        </label>
                    </div> */}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search notes, schemes, exams, Grade 3..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
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

                {/* Results Count and Material Type Filter */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {filteredMaterials.length} {filteredMaterials.length === 1 ? "material" : "materials"} found
                    </p>
                    <Select
                        value={selectedTypes.length === 1 ? selectedTypes[0] : "all"}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setSelectedTypes([]);
                            } else {
                                setSelectedTypes([value]);
                            }
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Material Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Material Types</SelectItem>
                            {Object.entries(MATERIAL_TYPE_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.icon} {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Materials Grid */}
                {paginatedMaterials.length === 0 ? (
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
                        <h3 className="text-xl font-semibold text-foreground mb-2">No materials found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mr-4">
                            {paginatedMaterials.map((material) => (
                                <div
                                    key={material.id}
                                    className={highlightMaterialId === material.id ? "ring-2 ring-primary rounded-lg" : ""}
                                >
                                    <PdfCard
                                        pdf={material}
                                        isPurchased={purchasedIds.has(material.id)}
                                        user={user}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(page)}
                                                    isActive={currentPage === page}
                                                    className="cursor-pointer"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
