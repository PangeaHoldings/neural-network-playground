"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LossPoint {
  epoch: number;
  loss: number;
}

interface LossChartClientProps {
  data: LossPoint[];
}

export default function LossChartClient({ data }: LossChartClientProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={160} minWidth={0}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--mit-gray-100)" />
        <XAxis
          dataKey="epoch"
          tick={{ fontSize: 12, fill: "var(--mit-gray-700)" }}
          stroke="var(--mit-gray-700)"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--mit-gray-700)" }}
          stroke="var(--mit-gray-700)"
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            borderColor: "var(--mit-gray-200)",
          }}
        />
        <Line
          type="monotone"
          dataKey="loss"
          stroke="var(--mit-red)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
