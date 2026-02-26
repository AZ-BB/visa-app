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
import type { Tables, Enums } from "@/database.types";

const APPLICATION_ORDER_STORAGE_KEY = "visa-application-order";

/** Temp traveller: DB travellers table without id, application_id */
export type TempTraveller = Omit<Tables<"travellers">, "id" | "application_id" | "created_at" | "updated_at">;

export type ApplicationStepId = 1 | 2 | 3 | 4 | 5;

/** Temp order: DB applications fields (no id, profile_id) + destination_country, nationality for routing + travellers + currentStep */
export interface ApplicationOrder {
  product_id: number | null;
  assigned_to: string | null;
  turnaround_time_id: number;
  turnaround_time_cost: number;
  price: number;
  contact_email: string;
  status: Enums<"application_status">;
  arrival_date: string;
  /** For routing (from apply flow). */
  destination_country: string;
  /** For default traveller nationality (from apply flow). */
  nationality: string;
  travellers: TempTraveller[];
  currentStep?: ApplicationStepId;
}

/** Migrate old stored shape to new DB-aligned shape */
function migrateStoredOrder(parsed: unknown): ApplicationOrder {
  const raw = parsed as Record<string, unknown>;
  const order = { ...defaultOrder, ...raw } as ApplicationOrder;
  if (order.travellers?.length) {
    order.travellers = order.travellers.map((t) => {
      const traveller = t as unknown as Record<string, unknown>;
      // Migrate camelCase -> snake_case
      if (traveller.firstName != null && traveller.first_name == null) {
        return {
          nationality: traveller.nationality ?? "",
          first_name: traveller.firstName ?? "",
          last_name: traveller.lastName ?? "",
          date_of_birth: traveller.dateOfBirth ?? "",
          passport_number: traveller.passportNumber ?? "",
          passport_expiry_date: traveller.passportExpiryDate ?? "",
          country_of_birth: traveller.countryOfBirth ?? "",
          country_of_residence: traveller.countryOfResidence ?? "",
        } as TempTraveller;
      }
      // Migrate passportDestination -> nationality
      if (traveller.passportDestination != null && traveller.nationality == null) {
        return { ...traveller, nationality: traveller.passportDestination } as unknown as TempTraveller;
      }
      return t as TempTraveller;
    });
  }
  if (order.product_id == null && (raw as { productId?: number }).productId != null) {
    order.product_id = (raw as { productId: number }).productId;
  }
  if (order.destination_country == null && (raw as { destinationCountry?: string }).destinationCountry != null) {
    order.destination_country = (raw as { destinationCountry: string }).destinationCountry;
  }
  const tripDetails = (raw as { tripDetails?: { arrivalDate?: string; email?: string } }).tripDetails;
  if (tripDetails) {
    if (tripDetails.arrivalDate && !order.arrival_date) {
      order.arrival_date = tripDetails.arrivalDate.split("T")[0] ?? tripDetails.arrivalDate;
    }
    if (tripDetails.email && !order.contact_email) {
      order.contact_email = tripDetails.email;
    }
  }
  const oldTurnaround = (raw as { turnaroundTime?: string }).turnaroundTime;
  if (oldTurnaround && order.turnaround_time_id === 1) {
    const map: Record<string, number> = { standard: 1, fast: 2, superfast: 3 };
    order.turnaround_time_id = map[oldTurnaround] ?? 1;
  }
  return order;
}

export function getStoredOrder(): ApplicationOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APPLICATION_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return migrateStoredOrder(parsed);
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
};

export const defaultOrder: ApplicationOrder = {
  product_id: null,
  assigned_to: null,
  turnaround_time_id: 1,
  turnaround_time_cost: 0,
  price: 0,
  contact_email: "",
  status: "NOT_STARTED",
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
}

const ApplicationOrderContext = createContext<ApplicationOrderContextValue | null>(null);

export function ApplicationOrderProvider({
  children,
  initialOrder,
}: {
  children: ReactNode;
  initialOrder?: Partial<ApplicationOrder>;
}) {
  const [order, setOrder] = useState<ApplicationOrder>(() => {
    const stored = getStoredOrder();
    const base = stored ? { ...defaultOrder, ...stored } : { ...defaultOrder, ...initialOrder };
    return base;
  });

  useEffect(() => {
    setStoredOrder(order);
  }, [order]);

  const updateOrder = useCallback((update: OrderUpdate) => {
    setOrder((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      return { ...prev, ...next };
    });
  }, []);

  const value = useMemo(
    () => ({ order, updateOrder }),
    [order, updateOrder]
  );

  return (
    <ApplicationOrderContext.Provider value={value}>
      {children}
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
