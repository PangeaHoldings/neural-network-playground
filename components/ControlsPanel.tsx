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
  isPaused: boolean;
  canTrain: boolean;
  onDatasetChange: (id: string) => void;
  onSeedChange: (seed: number) => void;
  onConfigChange: (config: ModelConfig) => void;
  onInitialize: () => void;
  onStep: () => void;
  onTrain: () => void;
  onPauseToggle: () => void;
  onReset: () => void;
}

const activationOptions: ActivationName[] = ["relu", "sigmoid", "tanh"];

export default function ControlsPanel({
  datasetOptions,
  datasetId,
  task,
  config,
  seed,
  metrics,
  isTraining,
  isPaused,
  canTrain,
  onDatasetChange,
  onSeedChange,
  onConfigChange,
  onInitialize,
  onStep,
  onTrain,
  onPauseToggle,
  onReset,
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
    <section className="card-panel flex flex-col gap-4 rounded-2xl p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">Controls</h2>
          <span className="flex items-center gap-2 text-xs text-(--mit-gray-700)">
            <span className={`h-2 w-2 rounded-full ${statusTone}`} />
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-(--mit-gray-700)">
          Configure a tiny network, then step through learning or run a short
          training burst.
        </p>
        <div className="rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-xs text-(--mit-gray-700)">
          Quick start: 1) Initialize 2) Step once 3) Train for a short run.
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-(--mit-gray-200) bg-(--mit-gray-50) p-4">
        <h3 className="text-sm font-semibold text-black">Metrics</h3>
        <div className="text-xs text-(--mit-gray-700)">
          Task: {task === "regression" ? "Regression" : "Classification"}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">Epoch</span>
            <span className="text-base font-semibold text-black">
              {metrics.epoch}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">
              Loss
              <span
                className="ml-1 text-xs text-(--mit-gray-700)"
                title="Average error between predictions and targets."
              >
                (i)
              </span>
            </span>
            <span className="text-base font-semibold text-black">
              {metrics.loss === null ? "-" : metrics.loss.toFixed(4)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-(--mit-gray-700)">
              Accuracy
              <span
                className="ml-1 text-xs text-(--mit-gray-700)"
                title="Share of correct classifications."
              >
                (i)
              </span>
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
              className="rounded-lg border border-(--mit-gray-200) bg-white px-2 py-1 text-sm"
              disabled={isTraining}
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
        <label className="text-sm font-medium text-black" title="Pick a dataset to explore.">
          Dataset
          <span
            className="ml-2 text-xs text-(--mit-gray-700)"
            title="Pick a dataset to see how the model behaves."
          >
            (info)
          </span>
        </label>
        <select
          value={datasetId}
          onChange={(event) => onDatasetChange(event.target.value)}
          className="rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
          disabled={isTraining}
        >
          {datasetOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-black"
            title="Number of hidden layers between inputs and outputs."
          >
            Hidden layers
          </label>
          <select
            value={config.hiddenLayers}
            onChange={(event) =>
              onConfigChange({
                ...config,
                hiddenLayers: Number(event.target.value),
              })
            }
            className="rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
            disabled={isTraining}
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
          >
            Neurons per layer
          </label>
          <input
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
            className="rounded-xl border border-(--mit-gray-200) bg-white px-3 py-2 text-sm"
            disabled={isTraining || config.hiddenLayers === 0}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-black"
          title="Nonlinearity applied after each hidden layer."
        >
          Activation (hidden layers)
        </label>
        <div className="flex flex-wrap gap-2">
          {activationOptions.map((activation) => (
            <button
              key={activation}
              type="button"
              onClick={() => onConfigChange({ ...config, activation })}
              className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                config.activation === activation
                  ? "border-(--mit-red) bg-(--mit-red) text-white"
                  : "border-(--mit-gray-200) text-black"
              }`}
              disabled={isTraining}
            >
              {activation}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-sm font-medium text-black"
          title="Step size for gradient descent updates."
        >
          Learning rate: {config.learningRate.toFixed(3)}
        </label>
        <input
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
        />
      </div>

      <div className="flex flex-col gap-3">
        <label
          className="text-sm font-medium text-black"
          title="Number of training passes when you click Train."
        >
          Epochs per run: {config.epochs}
        </label>
        <input
          type="range"
          min={1}
          max={200}
          step={1}
          value={config.epochs}
          onChange={(event) =>
            onConfigChange({
              ...config,
              epochs: Number(event.target.value),
            })
          }
          className="accent-(--mit-red)"
          disabled={isTraining}
        />
      </div>

    </section>
  );
}
