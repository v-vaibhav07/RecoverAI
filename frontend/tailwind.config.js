/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic surface tokens — all backed by CSS variables in index.css
        // so the whole theme can be re-themed from one place.
        bg: {
          DEFAULT: "var(--color-bg)",
          surface: "var(--color-surface)",
          elevated: "var(--color-elevated)",
          border: "var(--color-border)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        // Razorpay brand palette
        brand: {
          DEFAULT: "var(--color-brand)", // Dodger Blue #3395FF
          light: "var(--color-brand-light)",
          dark: "var(--color-brand-dark)",
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
        },
        navy: {
          DEFAULT: "var(--color-navy)", // #0C2651
          elevated: "var(--color-navy-elevated)",
          border: "var(--color-navy-border)",
          text: "var(--color-navy-text)",
          muted: "var(--color-navy-muted)",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        popover: "0 4px 6px -2px rgb(16 24 40 / 0.05), 0 12px 16px -4px rgb(16 24 40 / 0.08)",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
