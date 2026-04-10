"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function ApprovalActions({ pdfId }: { pdfId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);

    const handleAction = async () => {
        if (!actionType) return;

        setLoading(true);

        try {
            const res = await fetch("/api/pdf/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pdfId, status: actionType }),
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            toast.success(
                `Material ${actionType === "APPROVED" ? "approved" : "rejected"} successfully`
            );
            setShowDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update material status");
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (type: "APPROVED" | "REJECTED") => {
        setActionType(type);
        setShowDialog(true);
    };

    return (
        <>
            <div className="flex flex-col space-y-2 ml-4">
                <Button
                    onClick={() => openDialog("APPROVED")}
                    disabled={loading}
                    size="sm"
                    className="whitespace-nowrap"
                >
                    Approve
                </Button>
                <Button
                    onClick={() => openDialog("REJECTED")}
                    disabled={loading}
                    variant="destructive"
                    size="sm"
                    className="whitespace-nowrap"
                >
                    Reject
                </Button>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "APPROVED" ? "Approve" : "Reject"} Material
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {actionType?.toLowerCase()} this material?
                            {actionType === "APPROVED" &&
                                " This will make it visible in the marketplace."}
                            {actionType === "REJECTED" &&
                                " This will hide it from the marketplace."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={loading}
                            variant={actionType === "REJECTED" ? "destructive" : "default"}
                        >
                            {loading
                                ? "Processing..."
                                : actionType === "APPROVED"
                                    ? "Approve"
                                    : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
