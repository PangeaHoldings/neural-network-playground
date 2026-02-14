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
  epoch?: number;
}

export default function DataPlot({ dataset, task, network, insight, epoch }: DataPlotProps) {
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
  }, [dataset, network, task, epoch]);

  const heatmap = useMemo(() => {
    if (!network || task !== "classification") {
      return [] as { x: number; y: number; value: number }[];
    }
    const grid = 30;
    const cells = [] as { x: number; y: number; value: number }[];
    for (let i = 0; i < grid; i += 1) {
      for (let j = 0; j < grid; j += 1) {
        const x = (i + 0.5) / grid;
        const y = (j + 0.5) / grid;
        const value = predict(network, [x, y])[0];
        cells.push({ x: i / grid, y: j / grid, value });
      }
    }
    return cells;
  }, [network, task, epoch]);

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

  // Validate that the dataset has 2D inputs for classification
  const is2D = dataset.inputSize === 2;

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
        {!is2D ? (
          <div className="flex h-full items-center justify-center text-xs text-(--mit-gray-700)">
            Classification view requires 2D data.
          </div>
        ) : !network ? (
          <div className="flex h-full items-center justify-center text-xs text-(--mit-gray-700)">
            Initialize the model to see predicted probabilities.
          </div>
        ) : (
          <svg key={`heatmap-${epoch || 0}`} viewBox="0 0 100 100" className="h-full w-full rounded-xl" style={{ display: 'block' }}>
            {heatmap.map((cell, index) => {
              const intensity = Math.min(1, Math.max(0, cell.value));
              const red = Math.round(255 * intensity);
              const blue = Math.round(255 * (1 - intensity));
              const green = 30;
              const color = `rgb(${red}, ${green}, ${blue})`;
              const cellSize = 100 / 30;
              const x = cell.x * 100;
              const y = (1 - cell.y - 1/30) * 100;
              return (
                <rect
                  key={`cell-${index}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={color}
                  opacity={0.8}
                />
              );
            })}
            {dataset.points.map((point, index) => {
              const isClassOne = point.y[0] > 0.5;
              const x = point.x[0] * 100;
              const y = (1 - point.x[1]) * 100;
              const dotSize = 1.2;
              return (
                <circle
                  key={`point-${index}`}
                  cx={x}
                  cy={y}
                  r={dotSize}
                  fill={isClassOne ? "#FF1423" : "#4A5568"}
                  stroke="white"
                  strokeWidth="0.4"
                />
              );
            })}
          </svg>
        )}
      </div>
    </section>
  );
}
