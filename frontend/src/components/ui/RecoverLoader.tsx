import React from "react";

type LoaderSize = "sm" | "md" | "lg";
type LoaderVariant = "page" | "card" | "button";

interface RecoverLoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  className?: string;
  label?: string;
}

const sizeMap: Record<LoaderSize, { box: string; icon: string; ring: string }> = {
  sm: { box: "h-7 w-7", icon: "text-[13px]", ring: "h-5 w-5" },
  md: { box: "h-11 w-11", icon: "text-[18px]", ring: "h-8 w-8" },
  lg: { box: "h-14 w-14", icon: "text-[22px]", ring: "h-11 w-11" },
};

const variantMap: Record<LoaderVariant, string> = {
  page: "min-h-[18rem] w-full",
  card: "min-h-[10rem] w-full",
  button: "h-5 w-5 shrink-0",
};

export default function RecoverLoader({
  size = "md",
  variant = "page",
  className = "",
  label = "Loading",
}: RecoverLoaderProps) {
  const sizing = sizeMap[size];

  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center ${variantMap[variant]} ${className}`}
    >
      <span className={`recover-loader ${sizing.box}`} aria-hidden="true">
        <span className={`recover-loader-ring ${sizing.ring} recover-loader-ring-1`} />
        <span className={`recover-loader-ring ${sizing.ring} recover-loader-ring-2`} />
        <span className={`recover-loader-ring ${sizing.ring} recover-loader-ring-3`} />
        <span className={`recover-loader-core ${sizing.icon}`}>✦</span>
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
