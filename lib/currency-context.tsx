"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocale } from "next-intl";

import { formatCurrency } from "@/lib/currency";

const CurrencyContext = createContext<string>("EUR");

export function CurrencyProvider({ currency, children }: { currency: string; children: ReactNode }) {
  return <CurrencyContext.Provider value={currency}>{children}</CurrencyContext.Provider>;
}

export function useCurrencyFormatter() {
  const currency = useContext(CurrencyContext);
  const locale = useLocale();
  return useMemo(() => (amount: number | string) => formatCurrency(amount, currency, locale), [currency, locale]);
}
