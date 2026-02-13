"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ControlsPanel, { type ModelConfig } from "@/components/ControlsPanel";
import NetworkFlow from "@/components/NetworkFlow";
import LossChart from "@/components/LossChart";
import DataPlot from "@/components/DataPlot";
import ExplainPanel from "@/components/ExplainPanel";
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

  const networkRef = useRef<Network | null>(null);
  const metricsRef = useRef(metrics);
  const lossHistoryRef = useRef(lossHistory);
  const normalizedRef = useRef<NormalizedDataset>(normalized);
  const epochsRemainingRef = useRef(epochsRemaining);
  const trainingRef = useRef({ isTraining, isPaused });
  const flowTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

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
    setMetrics({ epoch: 0, loss: null, accuracy: null });
    setLossHistory([]);
    setLastGradients(null);
  };

  const triggerPulse = () => {
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
  };

  const runEpoch = () => {
    if (!networkRef.current) {
      return;
    }
    const result = trainEpoch(
      networkRef.current,
      normalizedRef.current,
      task,
      config.learningRate
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
  };

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

      const epochsThisFrame = Math.min(2, epochsRemainingRef.current);
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
  }, [isTraining, isPaused, config.learningRate, task]);

  const datasetDescription = useMemo(() => {
    const def = DATASET_OPTIONS.find((option) => option.id === datasetId);
    return def?.description ?? "";
  }, [datasetId]);

  return (
    <div className="h-screen bg-(--mit-gray-50)">
      <main className="mx-auto flex h-full w-full max-w-none flex-col gap-4 px-4 py-6 lg:px-10">
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
            <Link
              href="/glossary"
              className="rounded-full border border-(--mit-gray-200) px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
            >
              Open Glossary
            </Link>
          </div>
          <p className="max-w-4xl text-base text-(--mit-gray-700)">
            Explore a tiny neural network end to end: forward pass, loss, and
            gradient descent. Every line and edge updates from real training,
            using {datasetDescription}.
          </p>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_1fr]">
          <div className="flex min-h-0 flex-col gap-4">
            <ControlsPanel
              datasetOptions={DATASET_OPTIONS}
              datasetId={datasetId}
              task={task}
              config={config}
              seed={seed}
              metrics={metrics}
              isTraining={isTraining}
              isPaused={isPaused}
              canTrain={canTrain}
              onDatasetChange={(value) => {
                setDatasetId(value as DatasetId);
                setNetwork(null);
                setMetrics({ epoch: 0, loss: null, accuracy: null });
                setLossHistory([]);
                setLastGradients(null);
              }}
              onSeedChange={(value) => setSeed(value)}
              onConfigChange={(nextConfig) => setConfig(nextConfig)}
              onInitialize={handleInitialize}
              onStep={handleStep}
              onTrain={handleTrain}
              onPauseToggle={handlePauseToggle}
              onReset={handleReset}
            />
            <ExplainPanel />
          </div>
          <div className="grid min-h-0 gap-4 lg:grid-rows-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="relative h-full min-h-0">
              <NetworkFlow
                network={network}
                task={task}
                gradients={lastGradients}
                isFlowing={isFlowing}
                highlight={highlight}
              />
              <div className="absolute right-4 top-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-(--mit-gray-200) bg-white/95 px-3 py-2 text-xs shadow">
                <button
                  type="button"
                  onClick={handleInitialize}
                  className="rounded-full bg-(--mit-red) px-3 py-1 text-xs font-semibold text-white transition hover:bg-black"
                >
                  Initialize
                </button>
                <button
                  type="button"
                  onClick={handleStep}
                  className="rounded-full border border-(--mit-gray-200) px-3 py-1 text-xs font-semibold text-black transition hover:border-black"
                  disabled={!canTrain || isTraining}
                >
                  Step
                </button>
                <button
                  type="button"
                  onClick={handleTrain}
                  className="rounded-full border border-(--mit-red) px-3 py-1 text-xs font-semibold text-(--mit-red) transition hover:bg-(--mit-red) hover:text-white"
                  disabled={!canTrain || isTraining}
                >
                  Train
                </button>
                <button
                  type="button"
                  onClick={handlePauseToggle}
                  className="rounded-full border border-(--mit-gray-200) px-3 py-1 text-xs font-semibold text-black transition hover:border-black"
                  disabled={!isTraining}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-black px-3 py-1 text-xs font-semibold text-black transition hover:bg-black hover:text-white"
                  disabled={isTraining}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="grid min-h-0 gap-4 lg:grid-cols-2">
              <LossChart data={lossHistory} />
              <DataPlot dataset={dataset} task={task} network={network} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
