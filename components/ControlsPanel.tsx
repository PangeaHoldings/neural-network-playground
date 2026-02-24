"use client";

import type { ActivationName, DatasetDefinition, TaskType } from "@/lib/nn/types";

export interface ModelConfig {
  hiddenLayers: number;
  neurons: number;
  activation: ActivationName;
  learningRate: number;
  epochs: number;
}

interface Metrics {
  epoch: number;
  loss: number | null;
  accuracy: number | null;
}

interface ControlsPanelProps {
  datasetOptions: DatasetDefinition[];
  datasetId: string;
  task: TaskType;
  config: ModelConfig;
  seed: number;
  metrics: Metrics;
  isTraining: boolean;
  canTrain: boolean;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onDatasetChange: (id: string) => void;
  onSeedChange: (seed: number) => void;
  onConfigChange: (config: ModelConfig) => void;
}

export default function ControlsPanel({
  datasetOptions,
  datasetId,
  task,
  config,
  seed,
  metrics,
  isTraining,
  canTrain,
  showAdvanced,
  onToggleAdvanced,
  onDatasetChange,
  onSeedChange,
  onConfigChange,
}: ControlsPanelProps) {
  const statusLabel = !canTrain
    ? "Not initialized"
    : isTraining
    ? "Training"
    : metrics.epoch > 0
    ? "Trained"
    : "Initialized";
  const statusTone = !canTrain
    ? "bg-(--mit-gray-200)"
    : isTraining
    ? "bg-(--mit-bright-red)"
    : "bg-(--mit-red)";
  return (
    <section className="card-panel flex min-h-0 flex-1 flex-col gap-4 rounded-2xl p-4 sm:p-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-black">Controls</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleAdvanced}
              className="min-h-9 rounded-full border border-(--mit-gray-200) px-3 py-1 text-xs font-semibold text-black transition hover:border-black"
              aria-pressed={showAdvanced}
            >
              {showAdvanced ? "Hide advanced" : "Show advanced"}
            </button>
            <span className="flex items-center gap-2 text-xs text-(--mit-gray-700)">
              <span className={`h-2 w-2 rounded-full ${statusTone}`} />
              {statusLabel}
            </span>
          </div>
        </div>
        <p className="text-sm text-(--mit-gray-700)">
          Configure a tiny network, then step through learning or run a short
          training burst.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-(--mit-gray-200) bg-(--mit-gray-50) p-4">
        <h3 className="text-sm font-semibold text-black">Metrics</h3>
        <div className="text-xs text-(--mit-gray-700)">
          Task: {task === "regression" ? "Regression" : "Classification"}
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">Epoch</span>
            <span className="text-base font-semibold text-black">
              {metrics.epoch}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">
              Loss
              <button
                type="button"
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--mit-gray-200) text-xs text-(--mit-gray-700)"
                title="Average error between predictions and targets."
                aria-label="Loss help"
              >
                i
              </button>
            </span>
            <span className="text-base font-semibold text-black">
              {metrics.loss === null ? "-" : metrics.loss.toFixed(4)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">
              Accuracy
              <button
                type="button"
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--mit-gray-200) text-xs text-(--mit-gray-700)"
                title="Share of correct classifications."
                aria-label="Accuracy help"
              >
                i
              </button>
            </span>
            <span className="text-base font-semibold text-black">
              {metrics.accuracy === null
                ? task === "classification"
                  ? "-"
                  : "N/A"
                : `${(metrics.accuracy * 100).toFixed(1)}%`}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">Seed</span>
            <input
              type="number"
              value={seed}
              onChange={(event) => onSeedChange(Number(event.target.value))}
              className="min-h-10 rounded-lg border border-(--mit-gray-200) bg-white px-2 py-1 text-sm"
              disabled={isTraining}
              aria-label="Random seed for initialization"
            />
          </div>
        </div>
        <p className="text-xs text-(--mit-gray-700)">
          {metrics.epoch === 0
            ? "Click Initialize to create a model, then Step to see one learning update."
            : "Use Step for a single update or Train for multiple epochs."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--mit-gray-700)">
          Dataset
        </span>
        <label className="text-sm font-medium text-black" htmlFor="dataset-select">
          Dataset
          <button
            type="button"
            className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-(--mit-gray-200) text-xs text-(--mit-gray-700)"
            title="Pick a dataset to see how the model behaves."
            aria-label="Dataset help"
          >
            i
          </button>
        </label>
        <select
          id="dataset-select"
          value={datasetId}
          onChange={(event) => onDatasetChange(event.target.value)}
          className="min-h-10 rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
          disabled={isTraining}
          title={isTraining ? "Pause training to change datasets." : ""}
        >
          {datasetOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--mit-gray-700)">
          Model
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-black"
            title="Number of hidden layers between inputs and outputs."
            htmlFor="hidden-layers"
          >
            Hidden layers
          </label>
          <select
            id="hidden-layers"
            value={config.hiddenLayers}
            onChange={(event) =>
              onConfigChange({
                ...config,
                hiddenLayers: Number(event.target.value),
              })
            }
            className="min-h-10 rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
            disabled={isTraining}
            title={isTraining ? "Pause training to change the architecture." : ""}
          >
            {[0, 1, 2].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-black"
            title="Units in each hidden layer."
            htmlFor="neurons-per-layer"
          >
            Neurons per layer
          </label>
          <input
            id="neurons-per-layer"
            type="number"
            min={1}
            max={8}
            value={config.neurons}
            onChange={(event) =>
              onConfigChange({
                ...config,
                neurons: Number(event.target.value),
              })
            }
            className="min-h-10 rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
            disabled={isTraining || config.hiddenLayers === 0}
            title={
              isTraining
                ? "Pause training to change the architecture."
                : config.hiddenLayers === 0
                ? "Add a hidden layer to adjust neurons."
                : ""
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--mit-gray-700)">
          Training
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-sm font-medium text-black"
          title="Step size for gradient descent updates."
          htmlFor="learning-rate"
        >
          Learning rate: {config.learningRate.toFixed(3)}
        </label>
        <input
          id="learning-rate"
          type="range"
          min={0.001}
          max={1}
          step={0.001}
          value={config.learningRate}
          onChange={(event) =>
            onConfigChange({
              ...config,
              learningRate: Number(event.target.value),
            })
          }
          className="accent-(--mit-red)"
          disabled={isTraining}
          title={isTraining ? "Pause training to change the learning rate." : ""}
        />
      </div>

    </section>
  );
}
