"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MaterialsFilter({ currentStatus }: { currentStatus?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const setFilter = (status: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        router.push(`/admin/materials?${params.toString()}`);
    };

    const filters = [
        { label: "All", value: null },
        { label: "Approved", value: "APPROVED" },
        { label: "Pending", value: "PENDING" },
        { label: "Rejected", value: "REJECTED" },
    ];

    return (
        <div className="flex items-center space-x-2 mb-6">
            <span className="text-sm text-muted-foreground mr-2">Filter by status:</span>
            {filters.map((filter) => (
                <Button
                    key={filter.label}
                    variant={currentStatus === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(filter.value)}
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    );
}
