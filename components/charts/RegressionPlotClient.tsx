"use client";

import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

interface RegressionPlotClientProps {
  scatterData: { x: number; y: number }[];
  regressionLine: { x: number; y: number }[];
}

export default function RegressionPlotClient({
  scatterData,
  regressionLine,
}: RegressionPlotClientProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={160} minWidth={0}>
      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--mit-gray-100)" />
        <XAxis
          dataKey="x"
          type="number"
          tick={{ fontSize: 12, fill: "var(--mit-gray-700)" }}
          stroke="var(--mit-gray-700)"
        />
        <YAxis
          dataKey="y"
          type="number"
          tick={{ fontSize: 12, fill: "var(--mit-gray-700)" }}
          stroke="var(--mit-gray-700)"
        />
        <Scatter data={scatterData} fill="var(--mit-gray)" />
        <Line
          type="monotone"
          dataKey="y"
          data={regressionLine}
          stroke="var(--mit-red)"
          strokeWidth={2}
          dot={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
