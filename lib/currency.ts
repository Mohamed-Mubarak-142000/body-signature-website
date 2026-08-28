// Plain, framework-agnostic formatter usable from both server components
// (which can't call hooks) and the client-side useCurrencyFormatter hook.
export function formatCurrency(amount: number | string, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(Number(amount));
}
