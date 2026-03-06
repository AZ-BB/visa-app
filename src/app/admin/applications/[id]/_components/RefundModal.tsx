"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  totalFee: number;
  amountRefundedCents: number;
}

export function RefundModal({
  open,
  onOpenChange,
  applicationId,
  totalFee,
  amountRefundedCents,
}: RefundModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = Math.round(totalFee * 100);
  const maxRefundableCents = totalCents - amountRefundedCents;
  const maxRefundableDollars = (maxRefundableCents / 100).toFixed(2);

  const handleRefund = async () => {
    setError(null);
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount");
      return;
    }
    const amountCents = Math.round(amountNum * 100);
    if (amountCents > maxRefundableCents) {
      setError(`Maximum refundable is $${maxRefundableDollars}`);
      return;
    }
    if (amountCents < 50) {
      setError("Minimum refund is $0.50");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, amountCents }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to process refund");
        return;
      }
      onOpenChange(false);
      setAmount("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refund application</DialogTitle>
          <DialogDescription>
            Process a refund for this application. You can refund the full amount or a partial amount.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-secondary-copy">
              Total paid: <span className="font-semibold text-primary-copy">${totalFee.toFixed(2)}</span>
            </p>
            {amountRefundedCents > 0 && (
              <p className="text-sm text-secondary-copy">
                Already refunded: <span className="font-semibold text-primary-copy">${(amountRefundedCents / 100).toFixed(2)}</span>
              </p>
            )}
            <p className="text-sm text-secondary-copy">
              Max refundable: <span className="font-semibold text-primary-copy">${maxRefundableDollars}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Amount to refund ($)</Label>
            <Input
              id="refund-amount"
              type="number"
              step="0.01"
              min="0"
              max={maxRefundableCents / 100}
              placeholder={maxRefundableDollars}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={loading}>
            {loading ? "Processing…" : "Process refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
