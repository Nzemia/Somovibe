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

        setIsLoading(true);

        try {
            const res = await fetch("/api/wallet/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    phone: phoneNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Withdrawal failed");
            }

            toast.success("Withdrawal request initiated! Check your phone for M-Pesa prompt");
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
            {/* TODO :: Implement this */}
            {/* <Button
                onClick={() => setShowDialog(true)}
                disabled={balance <= 0}
                className="flex-1 sm:flex-none"
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
                Withdraw to M-Pesa
            </Button> */}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    {/* // TODO :: Implement this */}
                    {/* <DialogHeader>
                        <DialogTitle>Withdraw to M-Pesa</DialogTitle>
                        <DialogDescription>
                            Enter the amount you want to withdraw. Funds will be sent to your
                            M-Pesa account.
                        </DialogDescription>
                    </DialogHeader> */}

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
                                min="1"
                                max={balance}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Minimum: KES 1 | Maximum: KES {balance.toLocaleString()}
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
                                placeholder="254712345678"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Format: 254XXXXXXXXX
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
