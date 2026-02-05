"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Material = {
    id: string;
    title: string;
    status: string;
};

export default function MaterialActions({ material }: { material: Material }) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState<"APPROVED" | "REJECTED" | null>(null);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/material/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ materialId: material.id }),
            });

            if (!res.ok) throw new Error("Failed to delete material");

            toast.success("Material deleted successfully");
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete material");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/pdf/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pdfId: material.id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success(`Material ${newStatus.toLowerCase()} successfully`);
            setShowStatusDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update material status");
        } finally {
            setIsLoading(false);
        }
    };

    const openStatusDialog = (status: "APPROVED" | "REJECTED") => {
        setNewStatus(status);
        setShowStatusDialog(true);
    };

    return (
        <>
            <div className="flex items-center justify-end space-x-2">
                <a
                    href={`/api/pdf/download?pdfId=${material.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                    title="Preview/Download Material"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </a>
                {material.status !== "APPROVED" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog("APPROVED")}
                        className="text-green-600 hover:text-green-700"
                    >
                        Approve
                    </Button>
                )}
                {material.status !== "REJECTED" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog("REJECTED")}
                        className="text-orange-600 hover:text-orange-700"
                    >
                        Reject
                    </Button>
                )}
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    Delete
                </Button>
            </div>

            {/* Status Change Dialog */}
            <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {newStatus === "APPROVED" ? "Approve" : "Reject"} Material
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {newStatus?.toLowerCase()} "{material.title}
                            "?
                            {newStatus === "APPROVED" &&
                                " This will make it visible in the marketplace."}
                            {newStatus === "REJECTED" &&
                                " This will hide it from the marketplace."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusChange}
                            disabled={isLoading}
                            variant={newStatus === "REJECTED" ? "destructive" : "default"}
                        >
                            {isLoading
                                ? "Processing..."
                                : newStatus === "APPROVED"
                                    ? "Approve"
                                    : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Material</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{material.title}"? This action
                            cannot be undone. All associated purchases will also be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete Material"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
