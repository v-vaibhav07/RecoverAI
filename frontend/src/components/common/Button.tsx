import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import RecoverLoader from "../ui/RecoverLoader";
import { DURATION, EASE } from "../../lib/motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand hover:bg-brand-dark text-white shadow-sm shadow-brand/20",
  secondary: "bg-bg-surface hover:bg-bg-elevated text-text-primary border border-bg-border",
  ghost: "bg-transparent hover:bg-bg-elevated text-text-secondary",
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, className = "", children, disabled, ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ duration: DURATION.fast, ease: EASE }}
        className={`relative inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...(rest as HTMLMotionProps<"button">)}
      >
        <span className={`inline-flex items-center gap-2 ${loading ? "opacity-0" : ""}`}>
          {icon}
          {children}
        </span>
        {loading && (
          <span className="absolute inline-flex items-center justify-center">
            <RecoverLoader variant="button" size="sm" />
          </span>
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
export default Button;
