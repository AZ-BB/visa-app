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

const APPLICATION_ORDER_STORAGE_KEY = "visa-application-order";

export function getStoredOrder(): ApplicationOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APPLICATION_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as ApplicationOrder;
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

// --- Order type: one object for the whole application flow

export interface TripDetails {
  arrivalDate: string;
  email: string;
}

/** One traveller: personal info (Step 2) + passport info (Step 3) for the same person */
export interface Traveller {
  // Personal info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  deniedVisaLast6Months: "yes" | "no";
  // Passport info (same person)
  passportDestination: string;
  passportNumber: string;
  passportExpiryDate: string;
  countryOfBirth: string;
  countryOfResidence: string;
}

export type TurnaroundTimeId = "standard" | "fast" | "superfast";

export interface Costs {
  visaFee: number | null;
  turnaroundCost: number | null;
  total: number | null;
}

export type ApplicationStepId = 1 | 2 | 3 | 4 | 5;

export interface ApplicationOrder {
  destinationCountry: string;
  nationality: string;
  visaType: string;
  tripDetails: TripDetails;
  travellers: Traveller[];
  turnaroundTime: TurnaroundTimeId;
  costs: Costs;
  readyByDate: string;
  /** Last step the user was on (1–5). Used to resume application. */
  currentStep?: ApplicationStepId;
}

export const defaultTraveller: Traveller = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  deniedVisaLast6Months: "no",
  passportDestination: "",
  passportNumber: "",
  passportExpiryDate: "",
  countryOfBirth: "",
  countryOfResidence: "",
};

export const defaultOrder: ApplicationOrder = {
  destinationCountry: "",
  nationality: "",
  visaType: "",
  tripDetails: {
    arrivalDate: new Date().toISOString(),
    email: "",
  },
  travellers: [{ ...defaultTraveller }],
  turnaroundTime: "standard",
  costs: {
    visaFee: null,
    turnaroundCost: null,
    total: null,
  },
  readyByDate: "",
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
