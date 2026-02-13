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
  insight?: string;
}

export default function LossChart({ data, insight }: LossChartProps) {
  const latest = data.length ? data[data.length - 1].loss : null;
  const best = data.length
    ? Math.min(...data.map((point) => point.loss))
    : null;

  return (
    <section className="card-panel flex h-full min-h-0 flex-col rounded-2xl p-4">
      <header className="mb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-black">Loss over time</h3>
          <span className="text-xs text-(--mit-gray-700)">Lower is better</span>
          {insight ? (
            <span className="text-xs text-(--mit-gray-700)">{insight}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-(--mit-gray-700)">
          <span>
            Current: {latest === null ? "-" : latest.toFixed(4)}
          </span>
          <span>Best: {best === null ? "-" : best.toFixed(4)}</span>
        </div>
      </header>
      <div className="h-full min-h-40 w-full min-w-0">
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
      </div>
    </section>
  );
}
