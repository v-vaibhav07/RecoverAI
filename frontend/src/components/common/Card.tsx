import { motion } from "framer-motion";
import { fadeInUp } from "../../lib/motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export default function Card({ children, className = "", title, action }: CardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className={`rounded-2xl border border-bg-border bg-bg-surface shadow-card ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-bg-border px-5 py-4">
          {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
