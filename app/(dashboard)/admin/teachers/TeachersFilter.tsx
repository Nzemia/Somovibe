"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function TeachersFilter({
    currentStatus,
    currentSearch,
}: {
    currentStatus?: string;
    currentSearch?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(currentSearch || "");

    // Debounce search update in URL
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (search.trim()) {
                params.set("search", search.trim());
            } else {
                params.delete("search");
            }
            params.delete("page"); // Reset page on search
            router.push(`/admin/teachers?${params.toString()}`);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const setFilter = (status: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        params.delete("page"); // Reset page on filter switch
        router.push(`/admin/teachers?${params.toString()}`);
    };

    const filters = [
        { label: "All", value: null },
        { label: "Active", value: "active" },
        { label: "Pending Verification", value: "pending" },
    ];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Filter status:</span>
                {filters.map((filter) => (
                    <Button
                        key={filter.label}
                        variant={
                            currentStatus === filter.value || (!currentStatus && filter.value === null)
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() => setFilter(filter.value)}
                        className={
                            currentStatus === filter.value || (!currentStatus && filter.value === null)
                                ? "bg-[#008c43] text-white hover:bg-[#007035]"
                                : ""
                        }
                    >
                        {filter.label}
                    </Button>
                ))}
            </div>
            <div className="w-full md:w-72">
                <Input
                    placeholder="Search by email, name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9"
                />
            </div>
        </div>
    );
}
