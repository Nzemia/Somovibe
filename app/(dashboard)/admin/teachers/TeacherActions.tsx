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

type Teacher = {
    id: string;
    email: string;
    phone: string | null;
    teacherProfile: {
        isActive: boolean;
    } | null;
};

export default function TeacherActions({ teacher }: { teacher: Teacher }) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [phone, setPhone] = useState(teacher.phone || "");

    const handleToggleStatus = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/teacher/toggle-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: teacher.id }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            toast.success(
                `Teacher ${teacher.teacherProfile?.isActive ? "deactivated" : "activated"} successfully`
            );
            router.refresh();
        } catch (error) {
            toast.error("Failed to update teacher status");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/teacher/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: teacher.id }),
            });

            if (!res.ok) throw new Error("Failed to delete teacher");

            toast.success("Teacher deleted successfully");
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete teacher");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePhone = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/teacher/update-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: teacher.id, phone }),
            });

            if (!res.ok) throw new Error("Failed to update phone");

            toast.success("Phone number updated successfully");
            setShowEditDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update phone number");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isLoading}
                >
                    {teacher.teacherProfile?.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                >
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    Delete
                </Button>
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Teacher</DialogTitle>
                        <DialogDescription>
                            Update teacher information for {teacher.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Email
                            </label>
                            <input
                                type="email"
                                value={teacher.email}
                                disabled
                                className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="254712345678"
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePhone} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Teacher</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {teacher.email}? This action cannot
                            be undone. All their uploads and data will be permanently removed.
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
                            {isLoading ? "Deleting..." : "Delete Teacher"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
