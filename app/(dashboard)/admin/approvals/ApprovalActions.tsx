"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApprovalActions({ pdfId }: { pdfId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: "APPROVED" | "REJECTED") => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this material?`)) {
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/pdf/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pdfId, status }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            router.refresh();
        } catch (error) {
            alert("Failed to update material status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-2 ml-4">
            <button
                onClick={() => handleAction("APPROVED")}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
                {loading ? "Processing..." : "Approve"}
            </button>
            <button
                onClick={() => handleAction("REJECTED")}
                disabled={loading}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
                {loading ? "Processing..." : "Reject"}
            </button>
        </div>
    );
}
