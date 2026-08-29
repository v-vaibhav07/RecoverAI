// Shared motion tokens — keep every animation in the app consistent and
// easy to retune from one place. Durations are in seconds (Framer Motion
// convention). Easing matches the "snappy, not sluggish" brief.
import { Variants, Transition } from "framer-motion";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DURATION = {
  fast: 0.15,
  base: 0.22,
  slow: 0.32,
};

export const springTap: Transition = {
  type: "tween",
  duration: DURATION.fast,
  ease: EASE,
};

// Page-level transition — fade + slight upward slide on route change.
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE } },
};

// Stagger container for lists of cards / table rows.
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

// Modal / dialog — scale + fade.
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE } },
};

export const modalPanelVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: DURATION.fast, ease: EASE } },
};

// Toast slide-in from the right.
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, x: 24, scale: 0.98, transition: { duration: DURATION.fast, ease: EASE } },
};

// Small pop for cards/badges/inline reveals.
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};
