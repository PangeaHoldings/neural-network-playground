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

interface LossChartProps {
  data: LossPoint[];
}

export default function LossChart({ data }: LossChartProps) {
  return (
    <section className="card-panel flex h-full min-h-0 flex-col rounded-2xl p-4">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">Loss over time</h3>
        <span className="text-xs text-(--mit-gray-700)">
          Lower is better
        </span>
      </header>
      <div className="h-full min-h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
    </section>
  );
}
