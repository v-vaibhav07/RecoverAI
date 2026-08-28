import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  allowEmpty?: boolean;
  emptyLabel?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, allowEmpty, emptyLabel = "Select…", className = "", id, ...rest }, ref) => {
    const selectId = id || rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-lg border bg-bg-surface px-3 py-2 pr-9 text-sm text-text-primary outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand ${
              error ? "border-rose-500/60" : "border-bg-border"
            } ${className}`}
            {...rest}
          >
            {allowEmpty && <option value="">{emptyLabel}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;
