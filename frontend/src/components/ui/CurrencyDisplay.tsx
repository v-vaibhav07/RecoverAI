import { formatMoney } from "../../utils/money";

export default function CurrencyDisplay({
  value,
  currency = "INR",
  className = "",
}: {
  value: string | number | null | undefined;
  currency?: string;
  className?: string;
}) {
  return <span className={`tabular-nums ${className}`}>{formatMoney(value, currency)}</span>;
}
