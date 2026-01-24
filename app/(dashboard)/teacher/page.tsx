"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeacherPage() {
    const searchParams = useSearchParams();
    const verified = searchParams.get("verified");
    const uploaded = searchParams.get("upload");
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

    return (
        <div className="min-h-screen bg-background">
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in">
                    <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
                        <p className="text-muted-foreground">Manage your materials and track earnings</p>
                    </div>
                    <Link
                        href="/teacher/upload"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Upload Material</span>
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Uploads</h3>
                        <p className="text-3xl font-bold text-foreground">0</p>
                        <p className="text-xs text-muted-foreground mt-1">0 pending approval</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Approved</h3>
                        <p className="text-3xl font-bold text-primary">0</p>
                        <p className="text-xs text-muted-foreground mt-1">Live on marketplace</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Sales</h3>
                        <p className="text-3xl font-bold text-foreground">0</p>
                        <p className="text-xs text-muted-foreground mt-1">Across all materials</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Wallet Balance</h3>
                        <p className="text-3xl font-bold text-primary">KES 0</p>
                        <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <Link
                                href="/teacher/upload"
                                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">Upload New Material</h3>
                                        <p className="text-sm text-muted-foreground">Share your teaching resources</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/teacher/wallet"
                                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">View Wallet</h3>
                                        <p className="text-sm text-muted-foreground">Check earnings and withdraw</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Earnings Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Your Share</p>
                                    <p className="text-2xl font-bold text-primary">75%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                                    <p className="text-2xl font-bold text-foreground">25%</p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>• You earn KES 75 from every KES 100 sale</p>
                                <p>• Instant credit to your wallet</p>
                                <p>• Withdraw anytime via M-Pesa</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">My Materials</h2>
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No materials uploaded yet</h3>
                        <p className="text-muted-foreground mb-4">Start sharing your teaching resources and earn money</p>
                        <Link
                            href="/teacher/upload"
                            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                        >
                            Upload Your First Material
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
