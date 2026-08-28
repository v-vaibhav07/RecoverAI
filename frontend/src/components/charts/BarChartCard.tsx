import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { ChartEmptyState } from "./ChartEmptyState";
import { fadeInUp } from "../../lib/motion";

export interface BarDatum {
  name: string;
  value: number;
  color?: string;
}

export default function BarChartCard({
  data,
  height = 220,
  valueFormatter,
  color = "#3395FF",
  horizontal = false,
}: {
  data: BarDatum[];
  height?: number;
  valueFormatter?: (v: number) => string;
  color?: string;
  horizontal?: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return <ChartEmptyState height={height} label="No data to compare yet" />;
  }

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E9F1" vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#475467", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fill: "#475467", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            </>
          )}
          <Tooltip cursor={{ fill: "#F1F4F9" }} content={<ChartTooltip formatter={valueFormatter} />} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} animationDuration={500} animationEasing="ease-out" maxBarSize={36}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color ?? color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
