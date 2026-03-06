"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ArrowButton from "@/components/ArrowButton";
import {
  getStoredOrder,
  type ApplicationOrder,
} from "@/app/(client)/[country]/application/_components/ApplicationOrderContext";
import isVisaAvailable from "@/actions/visas";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, Loader2 } from "lucide-react";

/** Banner only shows when the stored order has Step 2 (personal info) data. */
function hasStep2Data(order: ApplicationOrder | null): boolean {
  if (!order || typeof order !== "object") return false;
  if (!order.destination_country?.trim()) return false;
  const travellers = order.travellers;
  if (!Array.isArray(travellers) || travellers.length === 0) return false;
  return travellers.some(
    (t) =>
      t.first_name?.trim() || t.last_name?.trim() || t.date_of_birth?.trim()
  );
}

export function ResumeApplicationBanner() {
  const [storedOrder, setStoredOrder] = useState<ReturnType<typeof getStoredOrder>>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visaAvailable, setVisaAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setStoredOrder(getStoredOrder());
  }, []);

  useEffect(() => {
    if (!storedOrder || !hasStep2Data(storedOrder)) return;
    if (!storedOrder.destination_country || !storedOrder.nationality || !storedOrder.visa_type_id) {
      setVisaAvailable(false);
      return;
    }
    isVisaAvailable(
      storedOrder.destination_country,
      storedOrder.nationality,
      storedOrder.visa_type_id
    ).then((res) => {
      setVisaAvailable(res.status === true);
    });
  }, [storedOrder]);

  function handleDismiss() {
    setDismissed(true);
    localStorage.removeItem('visa-application-order');
  }

  if (dismissed || !hasStep2Data(storedOrder) || visaAvailable !== true) return null;

  const step = storedOrder?.currentStep ?? 1;
  const applicationHref = storedOrder?.destination_country
    ? `/${storedOrder.destination_country}/application?step=${step}`
    : "#";

  return (
    <div className="bg-[#3CB179] text-white px-4 md:px-5 py-4 md:py-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg md:text-xl font-bold">Pick up where you left off</h3>
        <p className="font-normal text-sm md:text-base">
          Save time and jump back into your previously started application.
        </p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-white text-white bg-light-primary h-14 px-7 rounded-full hover:bg-white/20 border w-1/2 sm:w-auto"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
        <Link href={applicationHref} className="w-1/2 sm:w-auto">
          <Button
            className={cn("flex gap-3 group items-center justify-end sm:justify-center h-14 rounded-full text-sm pr-3 sm:pr-3 w-full")}
            variant={'outline'}
          >
            Continue
            <div className={cn(
              " w-8 h-8 rounded-full flex items-center justify-center bg-[#F3F6FC] group-hover:bg-white/60 transition-colors duration-100",

            )}>
              <ChevronRightIcon className={cn("size-5")} />
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
