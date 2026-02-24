"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Dataset, Network, TaskType } from "@/lib/nn/types";
import { predict } from "@/lib/nn/network";

interface DataPlotProps {
  dataset: Dataset;
  task: TaskType;
  network: Network | null;
  insight?: string;
  isTraining?: boolean;
}

const RegressionPlotClient = dynamic(
  () => import("./charts/RegressionPlotClient"),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-40 w-full" aria-hidden="true" />,
  }
);

export default function DataPlot({
  dataset,
  task,
  network,
  insight,
  isTraining = false,
}: DataPlotProps) {
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
    if (!network || task !== "classification" || network.inputSize < 2) {
      return [] as { x: number; y: number; value: number }[];
    }
    const grid = isTraining ? 18 : 30;
    const cells = [] as { x: number; y: number; value: number }[];
    for (let i = 0; i < grid; i += 1) {
      for (let j = 0; j < grid; j += 1) {
        const x = (i + 0.5) / grid;
        const y = (j + 0.5) / grid;
        const prediction = predict(network, [x, y])[0];
        const value = Number.isFinite(prediction) ? prediction : 0.5;
        cells.push({ x: i / grid, y: j / grid, value });
      }
    }
    return cells;
  }, [isTraining, network, task]);

  const classificationPoints = useMemo(() => {
    if (task !== "classification") {
      return [] as { x: number; y: number; isClassOne: boolean }[];
    }

    return dataset.points
      .filter(
        (point) =>
          point.x.length >= 2 &&
          point.y.length >= 1 &&
          Number.isFinite(point.x[0]) &&
          Number.isFinite(point.x[1])
      )
      .map((point) => ({
        x: point.x[0],
        y: point.x[1],
        isClassOne: point.y[0] > 0.5,
      }));
  }, [dataset.points, task]);

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
          <RegressionPlotClient scatterData={scatterData} regressionLine={regressionLine} />
        </div>
      </section>
    );
  }

  // Validate that the dataset has 2D inputs for classification
  const is2D = dataset.inputSize === 2;
  const hasCompatibleModel =
    !network || (network.inputSize === 2 && network.outputSize >= 1);

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
        <div className="h-2 w-32 rounded-full bg-linear-to-r from-(--mit-gray-700) via-(--mit-gray-100) to-(--mit-red)" />
        <span>High p</span>
      </div>
      <div className="relative h-full min-h-40 w-full min-w-0">
        {!is2D ? (
          <div className="flex h-full items-center justify-center text-xs text-(--mit-gray-700)">
            Classification view requires 2D data.
          </div>
        ) : !hasCompatibleModel ? (
          <div className="flex h-full items-center justify-center text-xs text-(--mit-gray-700)">
            Model shape does not match this dataset. Reinitialize to continue.
          </div>
        ) : !network ? (
          <div className="flex h-full items-center justify-center text-xs text-(--mit-gray-700)">
            Initialize the model to see predicted probabilities.
          </div>
        ) : (
          <svg viewBox="0 0 100 100" className="h-full w-full rounded-xl" style={{ display: "block" }}>
            {heatmap.map((cell, index) => {
              const intensity = Math.min(1, Math.max(0, cell.value));
              const red = Math.round(255 * intensity);
              const blue = Math.round(255 * (1 - intensity));
              const green = 30;
              const color = `rgb(${red}, ${green}, ${blue})`;
              const cellSize = 100 / Math.sqrt(heatmap.length || 1);
              const x = cell.x * 100;
              const y = (1 - cell.y - cellSize / 100) * 100;
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
            {classificationPoints.map((point, index) => {
              const x = point.x * 100;
              const y = (1 - point.y) * 100;
              const dotSize = 1.2;
              return (
                <circle
                  key={`point-${index}`}
                  cx={x}
                  cy={y}
                  r={dotSize}
                  fill={point.isClassOne ? "var(--mit-bright-red)" : "var(--mit-gray-700)"}
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
