"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type User = {
    id: string;
    email: string;
    phone: string | null;
};

export default function ProfileForm({ user }: { user: User }) {
    const router = useRouter();
    const [phone, setPhone] = useState(user.phone || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/user/phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update phone number");
            }

            toast.success("Phone number updated successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update phone number");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                </label>
                <Input type="email" value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                </p>
            </div>

            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number
                </label>
                <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="254712345678"
                    required
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Format: 254XXXXXXXXX (Used for M-Pesa withdrawals)
                </p>
            </div>

            <div className="flex items-center space-x-4">
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
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
                {phone !== user.phone && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPhone(user.phone || "")}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
