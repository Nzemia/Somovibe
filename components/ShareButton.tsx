"use client";

import { useState } from "react";
import { toast } from "sonner";

type ShareButtonProps = {
    url: string;
    title: string;
    description?: string;
    variant?: "icon" | "button" | "full";
    label?: string;
};

export default function ShareButton({
    url,
    title,
    description,
    variant = "button",
    label,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description || title,
                    url: fullUrl,
                });
            } catch (err) {
                // User cancelled or error - fallback to copy
                copyToClipboard(fullUrl);
            }
        } else {
            copyToClipboard(fullUrl);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleShare}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                title="Share"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
            </button>
        );
    }

    if (variant === "button") {
        return (
            <button
                onClick={handleShare}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                {copied ? "Copied!" : (label ?? "Share")}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
            </svg>
            {copied ? "Link Copied!" : "Share"}
        </button>
    );
}
