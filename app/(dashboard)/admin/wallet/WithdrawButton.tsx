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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function WithdrawButton({
    balance,
    phone,
}: {
    balance: number;
    phone: string | null;
}) {
    const router = useRouter();
    const [showDialog, setShowDialog] = useState(false);
    const [amount, setAmount] = useState("");
    const [phoneNumber, setPhoneNumber] = useState(phone || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleWithdraw = async () => {
        const withdrawAmount = parseInt(amount);

        if (!withdrawAmount || withdrawAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (withdrawAmount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        // Format phone number
        let formattedPhone = phoneNumber.replace(/\s/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "254" + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith("+254")) {
            formattedPhone = formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith("254")) {
            formattedPhone = "254" + formattedPhone;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/wallet/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    phone: formattedPhone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Withdrawal failed");
            }

            if (data.devMode) {
                toast.success("DEV MODE: Withdrawal completed instantly!");
            } else {
                toast.success("Withdrawal initiated! You will receive the money shortly.");
            }

            setShowDialog(false);
            setAmount("");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to process withdrawal");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                disabled={balance <= 0}
                size="lg"
            >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                </svg>
                Withdraw Platform Earnings
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Withdraw Platform Earnings</DialogTitle>
                        <DialogDescription>
                            Withdraw platform commission and verification fees to M-Pesa.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Available Balance
                            </label>
                            <div className="text-2xl font-bold text-primary">
                                KES {balance.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Withdrawal Amount
                            </label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="10"
                                max={balance}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Minimum: KES 10 | Maximum: KES {balance.toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                M-Pesa Phone Number
                            </label>
                            <Input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="254712345678 or 0712345678"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Format: 254XXXXXXXXX or 07XXXXXXXX
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleWithdraw} disabled={isLoading}>
                            {isLoading ? "Processing..." : "Withdraw"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
