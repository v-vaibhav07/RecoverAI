import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { fadeInUp } from "../../lib/motion";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

// Razorpay-blue-led palette used when the caller doesn't supply explicit colors.
export const DONUT_PALETTE = ["#3395FF", "#0C2651", "#5FACFF", "#94A3B8", "#CBD5E1"];

export default function DonutChart({
  data,
  height = 220,
  valueFormatter,
  centerLabel,
}: {
  data: DonutDatum[];
  height?: number;
  valueFormatter?: (v: number) => string;
  centerLabel?: { value: string; label: string };
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <ChartEmptyState height={height} label="Nothing to break down yet" />;
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
            animationDuration={500}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={7}
            formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ marginBottom: 24 }}>
          <span className="text-lg font-semibold text-text-primary">{centerLabel.value}</span>
          <span className="text-[10px] text-text-muted">{centerLabel.label}</span>
        </div>
      )}
    </motion.div>
  );
}
