"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import type { Dataset, Network, TaskType } from "@/lib/nn/types";
import { predict } from "@/lib/nn/network";

interface DataPlotProps {
  dataset: Dataset;
  task: TaskType;
  network: Network | null;
  insight?: string;
}

export default function DataPlot({ dataset, task, network, insight }: DataPlotProps) {
  const regressionLine = useMemo(() => {
    if (!network || task !== "regression") {
      return [] as { x: number; y: number }[];
    }
    const xs = dataset.points.map((point) => point.x[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const points = [] as { x: number; y: number }[];
    for (let i = 0; i <= 40; i += 1) {
      const x = minX + (i / 40) * (maxX - minX);
      const y = predict(network, [x])[0];
      points.push({ x, y });
    }
    return points;
  }, [dataset, network, task]);

  const heatmap = useMemo(() => {
    if (!network || task !== "classification") {
      return [] as { x: number; y: number; value: number }[];
    }
    const grid = 22;
    const cells = [] as { x: number; y: number; value: number }[];
    for (let i = 0; i < grid; i += 1) {
      for (let j = 0; j < grid; j += 1) {
        const x = i / (grid - 1);
        const y = j / (grid - 1);
        const value = predict(network, [x, y])[0];
        cells.push({ x, y, value });
      }
    }
    return cells;
  }, [network, task]);

  if (task === "regression") {
    const scatterData = dataset.points.map((point) => ({
      x: point.x[0],
      y: point.y[0],
    }));

    return (
      <section className="card-panel flex h-full min-h-0 flex-col rounded-2xl p-4">
        <header className="mb-2 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-black">Data + prediction</h3>
            <span className="text-xs text-(--mit-gray-700)">Regression view</span>
            {insight ? (
              <span className="text-xs text-(--mit-gray-700)">{insight}</span>
            ) : null}
          </div>
          <div className="text-xs text-(--mit-gray-700)">
            Gray dots = data, red line = prediction
          </div>
        </header>
        <div className="h-full min-h-40 w-full min-w-0">
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
        </div>
      </section>
    );
  }

  return (
    <section className="card-panel flex h-full min-h-0 flex-col rounded-2xl p-4">
      <header className="mb-2 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-black">Data + probability</h3>
          <span className="text-xs text-(--mit-gray-700)">Classification view</span>
          {insight ? (
            <span className="text-xs text-(--mit-gray-700)">{insight}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-(--mit-gray-700)">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-(--mit-red)" />
            Class 1
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 bg-(--mit-gray-700)" />
            Class 0
          </span>
        </div>
      </header>
      <div className="mb-2 flex items-center gap-3 text-xs text-(--mit-gray-700)">
        <span>Low p</span>
        <div className="h-2 w-32 rounded-full bg-linear-to-r from-[#1f3a93] via-[#cfd6db] to-[#750014]" />
        <span>High p</span>
      </div>
      <div className="relative h-full min-h-40 w-full min-w-0">
        <svg viewBox="0 0 100 100" className="h-full w-full rounded-xl">
          {heatmap.map((cell, index) => {
            const intensity = Math.min(1, Math.max(0, cell.value));
            const red = Math.round(255 * intensity);
            const blue = Math.round(255 * (1 - intensity));
            const color = `rgb(${red}, 30, ${blue})`;
            const x = cell.x * 100;
            const y = 100 - cell.y * 100;
            const size = 100 / 21;
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={size}
                height={size}
                fill={color}
                opacity={0.35}
              />
            );
          })}
          {dataset.points.map((point, index) => {
            const isClassOne = point.y[0] > 0.5;
            const x = point.x[0] * 100;
            const y = 100 - point.x[1] * 100;
            const size = 4.2;
            return isClassOne ? (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={2.3}
                fill="var(--mit-red)"
              />
            ) : (
              <rect
                key={index}
                x={x - size / 2}
                y={y - size / 2}
                width={size}
                height={size}
                fill="var(--mit-gray-700)"
              />
            );
          })}
        </svg>
        {!network ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-(--mit-gray-700)">
            Initialize the model to see predicted probabilities.
          </div>
        ) : null}
      </div>
    </section>
  );
}
