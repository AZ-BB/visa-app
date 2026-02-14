"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArrowButton from "@/components/ArrowButton";
import {
  getStoredOrder,
  type ApplicationOrder,
} from "@/app/[country]/application/_components/ApplicationOrderContext";

/** Banner only shows when the stored order has Step 2 (personal info) data. */
function hasStep2Data(order: ApplicationOrder | null): boolean {
  if (!order || typeof order !== "object") return false;
  if (!order.destinationCountry?.trim()) return false;
  const travellers = order.travellers;
  if (!Array.isArray(travellers) || travellers.length === 0) return false;
  return travellers.some(
    (t) =>
      t.firstName?.trim() || t.lastName?.trim() || t.dateOfBirth?.trim()
  );
}

export function ResumeApplicationBanner() {
  const [storedOrder, setStoredOrder] = useState<ReturnType<typeof getStoredOrder>>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setStoredOrder(getStoredOrder());
  }, []);

  if (dismissed || !hasStep2Data(storedOrder)) return null;

  const step = storedOrder?.currentStep ?? 1;
  const applicationHref = storedOrder?.destinationCountry
    ? `/${storedOrder.destinationCountry}/application?step=${step}`
    : "#";

  return (
    <div className="bg-[#3CB179] text-white px-5 py-5 rounded-2xl flex items-center justify-between shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Pick up where you left off</h3>
        <p className="font-normal">
          Save time and jump back into your previously started application.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white text-white bg-light-primary py-6 px-4 rounded-full hover:bg-white/20"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
        <Link href={applicationHref}>
          <ArrowButton
            variant="outline"
            className="text-sm py-6 pl-4 pr-2 border-border-default hover:text-white"
            iconContainerClassName="scale-80"
          >
            Continue
          </ArrowButton>
        </Link>
      </div>
    </div>
  );
}
