"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Tables } from "@/database.types";
import { usePathname, useRouter } from "next/navigation";
import isVisaAvailable, { fetchVisaById, VisaType } from "@/actions/visas";
import Link from "next/link";
import ArrowButton from "@/components/ArrowButton";
import { VisaProduct } from "@/actions/products";
import { createApplicationClient } from "@/actions/applications";
import type GeneralResponse from "@/types/general";

const APPLICATION_ORDER_STORAGE_KEY = "visa-application-order";

/** Temp traveller: DB travellers table without id, application_id */
export type TempTraveller = Omit<Tables<"travellers">, "id" | "application_id" | "created_at" | "updated_at" | "product_id" | "gov_fee" | "processing_fee"> & { product: Tables<"products"> | null };

export type ApplicationStepId = 1 | 2 | 3 | 4 | 5;

/** Temp order: DB applications fields (no id, profile_id) + destination_country, nationality for routing + travellers + currentStep */
export interface ApplicationOrder {
  turnaround_time_id: number | null;
  visa_type: Tables<"visa_types"> | null;
  visa_name: string;
  contact_email: string;
  arrival_date: string;
  /** For routing (from apply flow). */
  destination_country: string;
  /** For default traveller nationality (from apply flow). */
  nationality: string;
  visa_type_id: number;
  travellers: TempTraveller[];
  currentStep?: ApplicationStepId;
}

export function getStoredOrder(): ApplicationOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APPLICATION_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return { ...defaultOrder, ...parsed } as ApplicationOrder;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setStoredOrder(order: ApplicationOrder): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPLICATION_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

export const defaultTraveller: TempTraveller = {
  nationality: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  passport_number: "",
  passport_expiry_date: "",
  country_of_birth: "",
  country_of_residence: "",
  product: null,
};

export const defaultOrder: ApplicationOrder = {
  turnaround_time_id: null,
  visa_type_id: 0,
  visa_type: null,
  visa_name: "",
  contact_email: "",
  arrival_date: new Date().toISOString().split("T")[0] ?? "",
  destination_country: "",
  nationality: "",
  travellers: [{ ...defaultTraveller }],
  currentStep: 1,
};

export type OrderUpdate = Partial<ApplicationOrder> | ((prev: ApplicationOrder) => Partial<ApplicationOrder>);

interface ApplicationOrderContextValue {
  order: ApplicationOrder;
  updateOrder: (update: OrderUpdate) => void;
  handleCheckoutApplication: () => Promise<GeneralResponse<string>>;
  isLoading: boolean;
  travellerVisaErrors: Record<number, string> | null;
  turnaroundTimes: Tables<"turnaround_times">[];

  travellersProducts: Record<number, VisaProduct> | null;
  visaType: VisaType | null;
}

const ApplicationOrderContext = createContext<ApplicationOrderContextValue | null>(null);

export function ApplicationOrderProvider({
  children,
  turnaroundTimes = [],
}: {
  children: ReactNode;
  initialOrder?: Partial<ApplicationOrder>;
  turnaroundTimes?: Tables<"turnaround_times">[];
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<ApplicationOrder>(defaultOrder);

  const [visaError, setVisaError] = useState<string | null>(null);

  const [travellerVisaErrors, setTravellerVisaErrors] = useState<Record<number, string> | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const [visaType, setVisaType] = useState<VisaType | null>(null);
  const [travellersProducts, setTravellersProducts] = useState<VisaProduct[]>([]);

  useEffect(() => {
    async function validateOrder() {

      const stored = getStoredOrder();

      if (!stored) {
        router.push("/");
        return;
      }

      // Validate the initial order
      if (!stored.destination_country || !stored.nationality || !stored.visa_type_id) {
        router.push("/");
        return;
      }

      const { data: visaTypeRes } = await fetchVisaById(stored?.visa_type_id ?? 0);
      if (visaTypeRes) {
        setVisaType(visaTypeRes);
      }

      if (pathname !== `/${stored.destination_country}/application` || stored.visa_type_id === 0) {
        router.push(`/${stored.destination_country}/apply?from=${stored.nationality}`);
        return;
      }

      // Validate the arrival date
      if (stored.arrival_date && new Date(stored.arrival_date) < new Date()) {
        stored.arrival_date = "";
        setStoredOrder(stored);
      }

      // Validate the travellers
      if (stored.travellers.length === 0) {
        router.push(`/${stored.destination_country}/apply?from=${stored.nationality}`);
        return;
      }

      async function validateStep(stored: ApplicationOrder) {
        // Step 2: Contact email and arrival date
        if (!stored.contact_email || !stored.arrival_date) {
          stored.currentStep = 1;
          setStoredOrder(stored);
          return;
        }

        if (stored.arrival_date && new Date(stored.arrival_date) < new Date()) {
          stored.arrival_date = "";
          stored.currentStep = 1;
          setStoredOrder(stored);
          return;
        }

        // Step 3: Travellers
        if (!stored.travellers.every((t) => t.first_name && t.last_name && t.date_of_birth)) {
          stored.currentStep = 2;
          setStoredOrder(stored);
          return;
        }

        if (stored.travellers.some((t) => t.date_of_birth && new Date(t.date_of_birth) > new Date())) {
          console.log("travellers", stored.travellers);
          stored.travellers = stored.travellers.map((t) => ({ ...t, date_of_birth: new Date(t.date_of_birth) > new Date() ? "" : t.date_of_birth }));
          stored.currentStep = 2;
          setStoredOrder(stored);
          return;
        }

        // Step 4: Passport details
        if (!stored.travellers.every((t) => t.nationality && t.passport_number && t.passport_expiry_date && t.country_of_birth && t.country_of_residence)) {
          stored.currentStep = 3;
          setStoredOrder(stored);
          return;
        }

        if (stored.travellers.some((t) => t.passport_expiry_date && new Date(t.passport_expiry_date) < new Date())) {
          stored.travellers = stored.travellers.map((t) => ({ ...t, passport_expiry_date: new Date(t.passport_expiry_date) < new Date() ? "" : t.passport_expiry_date }));
          stored.currentStep = 3;
          setStoredOrder(stored);
          return;
        }

        const cashedProducts = new Map<string, Tables<"products">>();
        if (stored.travellers.some((t) => t.nationality)) {
          let i = 0;
          for (const traveller of stored.travellers) {
            if (traveller.nationality) {
              const cacheKey = `${traveller.nationality}-${stored.destination_country}-${stored.visa_type_id}`;
              if (cashedProducts.has(cacheKey)) {
                stored.travellers[i].product = cashedProducts.get(cacheKey) ?? null;
                setStoredOrder(stored);
                continue;
              }

              const { error: visaError, status, data: products } = await isVisaAvailable(stored.destination_country, traveller.nationality, stored.visa_type_id);

              console.log(visaError, status, products);
              if (!status) {
                setTravellerVisaErrors((prev) => ({ ...prev, [i]: visaError ?? "" }));
                stored.travellers[i].product = null;
                stored.currentStep = 3;
                setStoredOrder(stored);
                return;
              } else {
                console.log('PRODUCTS',products);
                stored.travellers[i].product = products ?? null;
                cashedProducts.set(cacheKey, products!);
                setStoredOrder(stored);
              }
            }

            i++;
          }
        }

        // Step 4: Turnaround time
        if (!stored.turnaround_time_id) {
          stored.currentStep = 4;
          setStoredOrder(stored);
          return;
        }

        if (stored.turnaround_time_id && !turnaroundTimes.some((tt) => tt.id === stored.turnaround_time_id)) {
          stored.turnaround_time_id = null;
          stored.currentStep = 4;
          setStoredOrder(stored);
          return;
        }
      }

      await validateStep(stored);
      setOrder(stored);
      setIsLoading(false);

      const { error: visaError, status } = await isVisaAvailable(stored.destination_country, stored.nationality, stored.visa_type_id);
      console.log(visaError, status);
      if (!status) {
        setVisaError(visaError ?? null);
      }
    }

    validateOrder();
  }, [pathname, router]);

  useEffect(() => {
    if (isLoading) return;
    setStoredOrder(order);
  }, [order, isLoading]);

  const updateOrder = useCallback((update: OrderUpdate) => {
    setOrder((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      return { ...prev, ...next };
    });
  }, []);

  const handleCheckoutApplication = useCallback(async (): Promise<GeneralResponse<string>> => {
    const currentOrder = order;
    if (!currentOrder.turnaround_time_id) {
      return { status: false, error: "Please select a turnaround time" };
    }

    return createApplicationClient({
      arrival_date: currentOrder.arrival_date,
      contact_email: currentOrder.contact_email,
      destination_country: currentOrder.destination_country,
      visa_type_id: currentOrder.visa_type_id,
      turnaround_time_id: currentOrder.turnaround_time_id,
      travellers: currentOrder.travellers.map((t) => ({
        first_name: t.first_name,
        last_name: t.last_name,
        date_of_birth: t.date_of_birth,
        passport_number: t.passport_number,
        passport_expiry_date: t.passport_expiry_date,
        country_of_birth: t.country_of_birth,
        country_of_residence: t.country_of_residence,
        nationality: t.nationality,
        product_id: t.product?.id ?? 0,
      })),
    });
  }, [order]);

  useEffect(() => { console.log(order) }, [order])

  const value = useMemo(
    () => ({ order, updateOrder, handleCheckoutApplication, isLoading, visaError, travellerVisaErrors, turnaroundTimes, travellersProducts, visaType }),
    [order, updateOrder, handleCheckoutApplication, isLoading, travellerVisaErrors, turnaroundTimes, travellersProducts, visaType]
  );

  return (
    <ApplicationOrderContext.Provider value={value}>
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        visaError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-10">
            <div className="text-xl font-bold text-center">{visaError}</div>

            <Link href={`/${order.destination_country}/apply?from=${order.nationality}`}>
              <ArrowButton>
                Try another visa
              </ArrowButton>
            </Link>
          </div>
        ) : (
          children
        )
      )}
    </ApplicationOrderContext.Provider>
  );
}

export function useApplicationOrder(): ApplicationOrderContextValue {
  const ctx = useContext(ApplicationOrderContext);
  if (!ctx) {
    throw new Error("useApplicationOrder must be used within ApplicationOrderProvider");
  }
  return ctx;
}
