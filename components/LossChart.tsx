"use client";

import dynamic from "next/dynamic";

interface LossPoint {
  epoch: number;
  loss: number;
}

interface LossChartProps {
  data: LossPoint[];
  insight?: string;
}

const LossChartClient = dynamic(() => import("./charts/LossChartClient"), {
  ssr: false,
  loading: () => <div className="h-full min-h-40 w-full" aria-hidden="true" />,
});

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
        <LossChartClient data={data} />
      </div>
    </section>
  );
}
