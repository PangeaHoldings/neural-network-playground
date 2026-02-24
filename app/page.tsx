"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ControlsPanel, { type ModelConfig } from "@/components/ControlsPanel";
import NetworkFlow from "@/components/NetworkFlow";
import LossChart from "@/components/LossChart";
import DataPlot from "@/components/DataPlot";
import { DATASET_OPTIONS, createDataset, normalizeDataset } from "@/lib/nn/datasets";
import { createNetwork, type NetworkConfig } from "@/lib/nn/network";
import { trainEpoch } from "@/lib/nn/training";
import type {
  Dataset,
  DatasetId,
  Gradients,
  Network,
  NormalizedDataset,
  TaskType,
} from "@/lib/nn/types";

const DEFAULT_CONFIG: ModelConfig = {
  hiddenLayers: 1,
  neurons: 4,
  activation: "relu",
  learningRate: 0.05,
  epochs: 50,
};

const DEFAULT_DATASET: DatasetId = "linear";
const ACTIVATION_OPTIONS: Array<"relu" | "sigmoid" | "tanh"> = [
  "relu",
  "sigmoid",
  "tanh",
];
const GLOSSARY_TERMS = [
  {
    term: "Activation",
    meaning:
      "A non-linear function applied to a neuron's input so the network can model curved patterns.",
  },
  {
    term: "Backpropagation",
    meaning:
      "The algorithm that computes gradients of the loss with respect to every weight.",
  },
  {
    term: "Bias",
    meaning:
      "A learned offset added to a neuron's weighted sum so it can shift its threshold.",
  },
  {
    term: "Binary Cross-Entropy (BCE)",
    meaning:
      "A loss function for binary classification that compares predicted probabilities to labels.",
  },
  {
    term: "Dataset",
    meaning:
      "A collection of input-output pairs used to train and evaluate a model.",
  },
  {
    term: "Epoch",
    meaning: "One full pass over the training dataset during learning.",
  },
  {
    term: "Forward pass",
    meaning:
      "The computation that produces model outputs from inputs using current weights.",
  },
  {
    term: "Gradient",
    meaning: "A slope value showing how the loss changes when a weight changes.",
  },
  {
    term: "Learning rate",
    meaning:
      "A step size that scales how much weights change during gradient descent.",
  },
  {
    term: "Loss",
    meaning: "A measure of how wrong the model's predictions are on average.",
  },
  {
    term: "Mean Squared Error (MSE)",
    meaning:
      "A loss function for regression that averages the squared prediction errors.",
  },
  {
    term: "Neuron",
    meaning:
      "A computational unit that combines inputs using weights, adds a bias, and applies an activation.",
  },
  {
    term: "Normalization",
    meaning:
      "Scaling inputs to a consistent range to improve training stability.",
  },
  {
    term: "Overfitting",
    meaning:
      "When a model memorizes the training data instead of learning general patterns.",
  },
  {
    term: "Prediction",
    meaning: "The model output for a given input after a forward pass.",
  },
  {
    term: "ReLU",
    meaning:
      "An activation function that outputs zero for negative inputs and the input itself otherwise.",
  },
  {
    term: "Sigmoid",
    meaning: "An activation function that maps values to the range 0 to 1.",
  },
  {
    term: "Tanh",
    meaning: "An activation function that maps values to the range -1 to 1.",
  },
  {
    term: "Weight",
    meaning:
      "A learned parameter that scales how much an input contributes to a neuron.",
  },
];

function buildDataset(id: DatasetId, seed: number): {
  dataset: Dataset;
  normalized: NormalizedDataset;
} {
  const dataset = createDataset(id, seed);
  const normalized = normalizeDataset(dataset);
  return { dataset, normalized };
}

export default function Home() {
  const [datasetId, setDatasetId] = useState<DatasetId>(DEFAULT_DATASET);
  const [seed, setSeed] = useState(42);
  const [{ dataset, normalized }, setDatasetState] = useState(() =>
    buildDataset(DEFAULT_DATASET, 42)
  );
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [network, setNetwork] = useState<Network | null>(null);
  const [metrics, setMetrics] = useState({
    epoch: 0,
    loss: null as number | null,
    accuracy: null as number | null,
  });
  const [lossHistory, setLossHistory] = useState<{ epoch: number; loss: number }[]>(
    []
  );
  const [lastGradients, setLastGradients] = useState<Gradients | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [epochsRemaining, setEpochsRemaining] = useState(0);
  const [isFlowing, setIsFlowing] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [explainMode, setExplainMode] = useState<"intuition" | "formal">(
    "intuition"
  );
  const trainingSpeed = 2;
  const [frozenLayers, setFrozenLayers] = useState<boolean[]>([]);

  const networkRef = useRef<Network | null>(null);
  const metricsRef = useRef(metrics);
  const lossHistoryRef = useRef(lossHistory);
  const normalizedRef = useRef<NormalizedDataset>(normalized);
  const epochsRemainingRef = useRef(epochsRemaining);
  const trainingRef = useRef({ isTraining, isPaused });
  const flowTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const glossaryOpenButtonRef = useRef<HTMLButtonElement | null>(null);
  const glossaryCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const glossaryDialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setDatasetState(buildDataset(datasetId, seed));
  }, [datasetId, seed]);

  useEffect(() => {
    normalizedRef.current = normalized;
  }, [normalized]);

  useEffect(() => {
    networkRef.current = network;
  }, [network]);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    lossHistoryRef.current = lossHistory;
  }, [lossHistory]);

  useEffect(() => {
    epochsRemainingRef.current = epochsRemaining;
  }, [epochsRemaining]);

  useEffect(() => {
    trainingRef.current = { isTraining, isPaused };
  }, [isTraining, isPaused]);

  useEffect(() => {
    if (!showGlossary) {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      lastFocusedElementRef.current = activeElement;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusRaf = window.requestAnimationFrame(() => {
      glossaryCloseButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowGlossary(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialogElement = glossaryDialogRef.current;
      if (!dialogElement) {
        return;
      }

      const focusable = dialogElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusRaf);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      lastFocusedElementRef.current?.focus();
    };
  }, [showGlossary]);

  const task = dataset.task as TaskType;

  const canTrain = Boolean(network);

  const handleInitialize = () => {
    const configForNetwork: NetworkConfig = {
      inputSize: dataset.inputSize,
      outputSize: dataset.outputSize,
      hiddenLayers: config.hiddenLayers,
      neuronsPerLayer: Math.max(1, config.neurons),
      activation: config.activation,
      task,
      inputMean: normalized.inputMean,
      inputStd: normalized.inputStd,
      seed,
    };
    const freshNetwork = createNetwork(configForNetwork);
    setNetwork(freshNetwork);
    setFrozenLayers(new Array(freshNetwork.layers.length).fill(false));
    setMetrics({ epoch: 0, loss: null, accuracy: null });
    setLossHistory([]);
    setLastGradients(null);
  };

  const triggerPulse = useCallback(() => {
    setIsFlowing(true);
    setHighlight(true);
    if (flowTimeoutRef.current) {
      window.clearTimeout(flowTimeoutRef.current);
    }
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    flowTimeoutRef.current = window.setTimeout(() => setIsFlowing(false), 600);
    highlightTimeoutRef.current = window.setTimeout(
      () => setHighlight(false),
      900
    );
  }, []);

  const runEpoch = useCallback(() => {
    if (!networkRef.current) {
      return;
    }
    const result = trainEpoch(
      networkRef.current,
      normalizedRef.current,
      task,
      config.learningRate,
      frozenLayers
    );
    const refreshedNetwork: Network = {
      ...result.network,
      layers: result.network.layers.map((layer) => ({
        ...layer,
        weights: layer.weights.map((row) => [...row]),
        biases: [...layer.biases],
      })),
    };
    const nextEpoch = metricsRef.current.epoch + 1;
    const nextMetrics = {
      epoch: nextEpoch,
      loss: result.loss,
      accuracy: result.accuracy ?? null,
    };
    const nextHistory = [
      ...lossHistoryRef.current,
      { epoch: nextEpoch, loss: result.loss },
    ];
    networkRef.current = refreshedNetwork;
    metricsRef.current = nextMetrics;
    lossHistoryRef.current = nextHistory;
    setNetwork(refreshedNetwork);
    setMetrics(nextMetrics);
    setLossHistory(nextHistory);
    setLastGradients(result.gradients);
    triggerPulse();
  }, [config.learningRate, frozenLayers, task, triggerPulse]);

  const handleStep = () => {
    if (!network) {
      return;
    }
    runEpoch();
  };

  const handleTrain = () => {
    if (!network) {
      return;
    }
    setIsTraining(true);
    setIsPaused(false);
    setEpochsRemaining(config.epochs);
  };

  const handlePauseToggle = () => {
    if (!isTraining) {
      return;
    }
    setIsPaused((prev) => !prev);
  };

  const handleReset = () => {
    setDatasetId(DEFAULT_DATASET);
    setSeed(42);
    setConfig(DEFAULT_CONFIG);
    setNetwork(null);
    setFrozenLayers([]);
    setMetrics({ epoch: 0, loss: null, accuracy: null });
    setLossHistory([]);
    setLastGradients(null);
    setIsTraining(false);
    setIsPaused(false);
    setEpochsRemaining(0);
  };

  useEffect(() => {
    if (!isTraining || isPaused) {
      return;
    }

    let rafId = 0;

    const trainFrame = () => {
      if (!trainingRef.current.isTraining || trainingRef.current.isPaused) {
        return;
      }
      if (!networkRef.current) {
        setIsTraining(false);
        return;
      }
      if (epochsRemainingRef.current <= 0) {
        setIsTraining(false);
        return;
      }

      const epochsThisFrame = Math.min(trainingSpeed, epochsRemainingRef.current);
      for (let i = 0; i < epochsThisFrame; i += 1) {
        runEpoch();
        epochsRemainingRef.current -= 1;
      }
      setEpochsRemaining(epochsRemainingRef.current);

      if (epochsRemainingRef.current > 0) {
        rafId = window.requestAnimationFrame(trainFrame);
      } else {
        setIsTraining(false);
      }
    };

    rafId = window.requestAnimationFrame(trainFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [isTraining, isPaused, runEpoch, trainingSpeed]);

  const datasetDescription = useMemo(() => {
    const def = DATASET_OPTIONS.find((option) => option.id === datasetId);
    return def?.description ?? "";
  }, [datasetId]);

  const trainingTarget = Math.max(2, config.epochs);
  const trainingDone = metrics.epoch >= trainingTarget;
  const trainingState = isTraining
    ? "In progress"
    : trainingDone
    ? "Done"
    : "Next";

  const explainIsFormal = explainMode === "formal";
  const lossInsight = explainIsFormal
    ? "Loss is the mean error per epoch (lower is better)."
    : metrics.epoch === 0
    ? "Run a step to see the first drop."
    : "Each update nudges weights to reduce the error.";
  const dataInsight = explainIsFormal
    ? task === "classification"
      ? "Colors represent predicted probability for class 1."
      : "The red line is the model output after normalization."
    : task === "classification"
    ? "Hotter areas mean higher confidence."
    : "The line bends as the network learns.";
  return (
    <div className="min-h-screen bg-(--mit-gray-50) lab-background overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-none flex-col gap-4 px-4 py-6 lg:px-10"
      >
        <header className="flex shrink-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-(--mit-gray-700)">
                MIT-inspired neural learning lab
              </span>
              <h1 className="text-3xl font-semibold text-black md:text-4xl">
                Neural Network Playground
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-(--mit-gray-200) bg-white p-1 text-xs font-semibold text-black">
                <button
                  type="button"
                  onClick={() => setExplainMode("intuition")}
                  className={`rounded-full px-3 py-1 transition ${
                    explainMode === "intuition"
                      ? "bg-(--mit-red) text-white"
                      : "text-black"
                  }`}
                  aria-pressed={explainMode === "intuition"}
                >
                  Intuition
                </button>
                <button
                  type="button"
                  onClick={() => setExplainMode("formal")}
                  className={`rounded-full px-3 py-1 transition ${
                    explainMode === "formal"
                      ? "bg-(--mit-red) text-white"
                      : "text-black"
                  }`}
                  aria-pressed={explainMode === "formal"}
                >
                  Formal
                </button>
              </div>
              <button
                ref={glossaryOpenButtonRef}
                type="button"
                onClick={() => setShowGlossary(true)}
                className="min-h-10 rounded-full border border-(--mit-gray-200) px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
                aria-label="Open glossary"
                aria-haspopup="dialog"
                aria-controls="glossary-dialog"
                aria-expanded={showGlossary}
              >
                Open Glossary
              </button>
            </div>
          </div>
          <p className="max-w-4xl text-base text-(--mit-gray-700)">
            Explore a tiny neural network end to end: forward pass, loss, and
            gradient descent. Every line and edge updates from real training,
            using {datasetDescription}.
          </p>
        </header>

        <section className="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid min-h-0 min-w-0 gap-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            <ControlsPanel
              datasetOptions={DATASET_OPTIONS}
              datasetId={datasetId}
              task={task}
              config={config}
              seed={seed}
              metrics={metrics}
              isTraining={isTraining}
              canTrain={canTrain}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced((prev) => !prev)}
              onDatasetChange={(value) => {
                setDatasetId(value as DatasetId);
                setNetwork(null);
                setFrozenLayers([]);
                setMetrics({ epoch: 0, loss: null, accuracy: null });
                setLossHistory([]);
                setLastGradients(null);
              }}
              onSeedChange={(value) => setSeed(value)}
              onConfigChange={(nextConfig) => setConfig(nextConfig)}
            />
          </div>
          <div className="grid min-h-0 min-w-0 gap-4 lg:grid-rows-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative min-h-[320px] h-[min(58vh,560px)] lg:h-full">
              <NetworkFlow
                network={network}
                task={task}
                gradients={lastGradients}
                isFlowing={isFlowing}
                highlight={highlight}
                frozenLayers={frozenLayers}
              />
              <div className="mt-3 flex w-full min-w-0 flex-col gap-2 md:absolute md:right-4 md:top-4 md:mt-0 md:w-64 md:max-w-full">
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-(--mit-gray-200) bg-white/95 px-3 py-2 text-xs shadow">
                  <span
                    className="min-h-8 rounded-full bg-(--mit-gray-100) px-3 py-1 text-xs font-semibold text-(--mit-gray-700)"
                    role="status"
                    aria-live="polite"
                  >
                    {isTraining ? "Training" : isPaused ? "Paused" : "Idle"}
                  </span>
                  <button
                    type="button"
                    onClick={handleInitialize}
                    className="min-h-10 rounded-full bg-(--mit-red) px-3 py-2 text-sm font-semibold text-white transition hover:bg-black"
                    aria-label="Initialize model"
                    title="Initialize the model with random weights"
                  >
                    Initialize
                  </button>
                  <button
                    type="button"
                    onClick={handleStep}
                    className="min-h-10 rounded-full border border-(--mit-gray-200) px-3 py-2 text-sm font-semibold text-black transition hover:border-black"
                    disabled={!canTrain || isTraining}
                    aria-label="Run one training step"
                    title={
                      !canTrain
                        ? "Initialize the model first."
                        : isTraining
                        ? "Pause training to step manually."
                        : "Run one training step"
                    }
                  >
                    Step
                  </button>
                  <button
                    type="button"
                    onClick={handleTrain}
                    className="min-h-10 rounded-full border border-(--mit-red) px-3 py-2 text-sm font-semibold text-(--mit-red) transition hover:bg-(--mit-red) hover:text-white"
                    disabled={!canTrain || isTraining}
                    aria-label="Run training"
                    title={
                      !canTrain
                        ? "Initialize the model first."
                        : isTraining
                        ? "Training is already running."
                        : "Run training for selected epochs"
                    }
                  >
                    Train
                  </button>
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="min-h-10 rounded-full border border-(--mit-gray-200) px-3 py-2 text-sm font-semibold text-black transition hover:border-black"
                    disabled={!isTraining}
                    aria-label={isPaused ? "Resume training" : "Pause training"}
                    title={isTraining ? "Pause or resume training" : "Start training to enable pause"}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-10 rounded-full border border-black px-3 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                    disabled={isTraining}
                    aria-label="Reset to defaults"
                    title={isTraining ? "Pause training to reset" : "Reset all settings"}
                  >
                    Reset
                  </button>
                </div>
                <div className="rounded-xl border border-(--mit-gray-200) bg-white/95 p-3 text-xs text-(--mit-gray-700) shadow">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--mit-gray-700)">
                    Learning checklist
                  </div>
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-black">1) Initialize</span>
                      <span className="text-xs font-semibold text-(--mit-gray-700)">
                        {canTrain ? "Done" : "Next"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black">2) Step once</span>
                      <span className="text-xs font-semibold text-(--mit-gray-700)">
                        {metrics.epoch > 0 ? "Done" : "Next"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black">3) Train</span>
                      <span className="text-xs font-semibold text-(--mit-gray-700)">
                        {trainingState}
                      </span>
                    </div>
                  </div>
                </div>
                {showAdvanced ? (
                  <div className="rounded-xl border border-(--mit-gray-200) bg-white/95 p-3 text-xs text-(--mit-gray-700) shadow">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--mit-gray-700)">
                      Advanced controls
                    </div>
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-black">
                          Activation (hidden layers)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ACTIVATION_OPTIONS.map((activation) => (
                            <button
                              key={activation}
                              type="button"
                              onClick={() =>
                                setConfig({ ...config, activation })
                              }
                              className={`min-h-9 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                config.activation === activation
                                  ? "border-(--mit-red) bg-(--mit-red) text-white"
                                  : "border-(--mit-gray-200) text-black"
                              }`}
                              disabled={isTraining}
                              aria-pressed={config.activation === activation}
                            >
                              {activation}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-xs font-semibold text-black"
                          htmlFor="epochs-per-run"
                        >
                          Epochs per run: {config.epochs}
                        </label>
                        <input
                          id="epochs-per-run"
                          type="range"
                          min={1}
                          max={200}
                          step={1}
                          value={config.epochs}
                          onChange={(event) =>
                            setConfig({
                              ...config,
                              epochs: Number(event.target.value),
                            })
                          }
                          className="accent-(--mit-red)"
                          disabled={isTraining}
                          title={isTraining ? "Pause training to change epochs." : ""}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid min-h-0 min-w-0 gap-4 lg:grid-cols-2">
              <div className="min-w-0">
                <LossChart data={lossHistory} insight={lossInsight} />
              </div>
              <div className="min-w-0">
                <DataPlot
                  dataset={dataset}
                  task={task}
                  network={network}
                  insight={dataInsight}
                  isTraining={isTraining}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      {showGlossary ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Neural network glossary"
        >
          <div
            id="glossary-dialog"
            ref={glossaryDialogRef}
            className="card-panel flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex items-center justify-between border-b border-(--mit-gray-200) px-4 py-4 sm:px-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.35em] text-(--mit-gray-700)">
                  Reference
                </div>
                <h2 className="text-2xl font-semibold text-black">
                  Neural Network Glossary
                </h2>
              </div>
              <button
                ref={glossaryCloseButtonRef}
                type="button"
                onClick={() => setShowGlossary(false)}
                className="min-h-10 rounded-full border border-(--mit-gray-200) px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
                aria-label="Close glossary"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto px-4 py-4 sm:px-6">
              <p className="max-w-3xl text-sm text-(--mit-gray-700)">
                Plain-language definitions of the terms used throughout the
                playground.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {GLOSSARY_TERMS.map((item) => (
                  <div
                    key={item.term}
                    className="rounded-xl border border-(--mit-gray-200) bg-white p-4"
                  >
                    <div className="text-sm font-semibold text-black">
                      {item.term}
                    </div>
                    <div className="mt-2 text-sm text-(--mit-gray-700)">
                      {item.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
