import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { fadeInUp } from "../../lib/motion";

// Single-value gauge for rate/percentage-style metrics (e.g. recovery rate,
// action success rate). Value is 0-100.
export default function RadialGauge({
  value,
  label,
  height = 180,
  color = "#3395FF",
  trackColor = "#EAF4FF",
}: {
  value: number;
  label?: string;
  height?: number;
  color?: string;
  trackColor?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: "value", value: clamped, fill: color }];

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: trackColor }}
            dataKey="value"
            cornerRadius={8}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-text-primary">{clamped.toFixed(0)}%</span>
        {label && <span className="mt-0.5 text-[11px] text-text-muted">{label}</span>}
      </div>
    </motion.div>
  );
}
