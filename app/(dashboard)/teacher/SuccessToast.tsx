"use client";

import { useEffect, useState } from "react";

export default function SuccessToast({
    verified,
    uploaded,
}: {
    verified?: string;
    uploaded?: string;
}) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (verified === "true") {
            setSuccessMessage("Payment Successful! Your teacher account is now active");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } else if (uploaded === "success") {
            setSuccessMessage("Material uploaded successfully! Awaiting admin approval");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [verified, uploaded]);

    if (!showSuccess) return null;

    return (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in">
            <div className="flex items-center space-x-3">
                <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <div>
                    <p className="font-semibold">{successMessage}</p>
                </div>
            </div>
        </div>
    );
}
