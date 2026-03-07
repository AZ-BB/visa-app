"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefundModal } from "./RefundModal";

interface RefundButtonProps {
  applicationId: string;
  totalFee: number;
  amountRefundedCents: number;
  stripePaymentIntentId: string | null;
  isPaid: boolean;
}

export function RefundButton({
  applicationId,
  totalFee,
  amountRefundedCents,
  stripePaymentIntentId,
  isPaid,
}: RefundButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const totalCents = Math.round(totalFee * 100);
  const maxRefundableCents = totalCents - amountRefundedCents;
  const canRefund = isPaid && stripePaymentIntentId && maxRefundableCents >= 50;

  if (!canRefund) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="h-10 gap-1.5"
      >
        <RotateCcw className="size-4" />
        Refund
      </Button>
      <RefundModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        applicationId={applicationId}
        totalFee={totalFee}
        amountRefundedCents={amountRefundedCents}
      />
    </>
  );
}
