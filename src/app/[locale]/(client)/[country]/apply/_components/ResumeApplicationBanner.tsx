"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getStoredOrder } from "../../application/_components/ApplicationOrderContext";
import isVisaAvailable from "@/actions/visas";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ResumeApplicationBanner() {
  const t = useTranslations("apply");
  const [storedOrder, setStoredOrder] = useState<ReturnType<typeof getStoredOrder>>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visaAvailable, setVisaAvailable] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStoredOrder(getStoredOrder());
  }, []);

  useEffect(() => {
    if (!storedOrder) {
      console.log("[ResumeApplicationBanner] Skipping: no stored order");
      return;
    }
    if (!storedOrder.destination_country || !storedOrder.nationality || !storedOrder.visa_type_id) {
      console.log("[ResumeApplicationBanner] Missing required fields, visa unavailable", {
        destination_country: storedOrder.destination_country,
        nationality: storedOrder.nationality,
        visa_type_id: storedOrder.visa_type_id,
      });
      setVisaAvailable(false);
      return;
    }

    console.log("[ResumeApplicationBanner] Checking visa availability", {
      destination: storedOrder.destination_country,
      nationality: storedOrder.nationality,
      visa_type_id: storedOrder.visa_type_id,
    });

    isVisaAvailable(
      storedOrder.destination_country,
      storedOrder.nationality,
      storedOrder.visa_type_id
    ).then((res) => {
      console.log("[ResumeApplicationBanner] Visa check result:", res.status, res.error ?? "");
      setVisaAvailable(res.status === true);
    });
  }, [storedOrder]);

  useEffect(() => {
    if (!dismissed && storedOrder && visaAvailable === true) {
      let cancelled = false;
      const t1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setMounted(true);
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(t1);
      };
    }
  }, [dismissed, storedOrder, visaAvailable]);

  function handleDismiss() {
    setDismissed(true);
    localStorage.removeItem('visa-application-order');
  }

  if (dismissed || !storedOrder || visaAvailable !== true) return null;

  const step = storedOrder?.currentStep ?? 1;
  const applicationHref = storedOrder?.destination_country
    ? `/${storedOrder.destination_country}/application?step=${step}`
    : "#";

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        mounted ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="bg-[#3CB179] text-white px-4 md:px-5 py-4 md:py-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg md:text-xl font-bold">{t("resumeTitle")}</h3>
            <p className="font-normal text-sm md:text-base">
              {t("resumeDescription")}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white text-white bg-light-primary h-14 px-7 rounded-full hover:bg-white/20 border w-1/2 sm:w-auto"
              onClick={handleDismiss}
            >
              {t("dismiss")}
            </Button>
            <Link href={applicationHref} className="w-1/2 sm:w-auto">
              <Button
                className={cn("flex gap-3 group items-center justify-end sm:justify-center h-14 rounded-full text-sm pr-3 sm:pr-3 w-full")}
                variant={'outline'}
              >
                {t("continue")}
                <div className={cn(
                  " w-8 h-8 rounded-full flex items-center justify-center bg-[#F3F6FC] group-hover:bg-white/60 transition-colors duration-100",
                )}>
                  <ChevronRightIcon className={cn("size-5")} />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
