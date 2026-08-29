// Money is returned by the backend as Prisma Decimal -> JSON string (e.g. "1000.00").
// Never parse with parseFloat for arithmetic beyond display; for display, Number()
// is fine since we're only formatting, not doing further money math client-side.

const CURRENCY_LOCALE: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function formatMoney(value: string | number | null | undefined, currency: string = "INR"): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

export function formatNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(value: string | number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  // recovery_probability is stored as a 0..1 decimal in the schema (Decimal(5,4))
  const pct = num <= 1 ? num * 100 : num;
  return `${pct.toFixed(fractionDigits)}%`;
}
