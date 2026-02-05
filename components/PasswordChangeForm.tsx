"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PasswordChangeForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (currentPassword === newPassword) {
            toast.error("New password must be different from current password");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update password");
            }

            toast.success("Password updated successfully");

            // Clear form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswords(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswords(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    Current Password
                </label>
                <div className="relative">
                    <Input
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    New Password
                </label>
                <div className="relative">
                    <Input
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        disabled={isLoading}
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 6 characters long
                </p>
            </div>

            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    Confirm New Password
                </label>
                <div className="relative">
                    <Input
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="showPasswords"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                />
                <label
                    htmlFor="showPasswords"
                    className="text-sm text-muted-foreground cursor-pointer"
                >
                    Show passwords
                </label>
            </div>

            <div className="flex items-center space-x-4 pt-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Updating Password...
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
                {(currentPassword || newPassword || confirmPassword) && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </div>

            <div className="bg-accent/50 border border-border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <svg
                        className="w-5 h-5 text-primary mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Security Tips:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Use a strong, unique password</li>
                            <li>• Don't share your password with anyone</li>
                            <li>• Change your password regularly</li>
                            <li>• Use a mix of letters, numbers, and symbols</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    );
}
