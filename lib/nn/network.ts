import type { ActivationName, Layer, Network, TaskType } from "./types";
import { ACTIVATIONS } from "./activations";
import { createRng } from "./utils";

export interface NetworkConfig {
    inputSize: number;
    outputSize: number;
    hiddenLayers: number;
    neuronsPerLayer: number;
    activation: ActivationName;
    task: TaskType;
    inputMean: number[];
    inputStd: number[];
    seed: number;
}

export interface ForwardPass {
    activations: number[][];
    preActivations: number[][];
}

export function createNetwork(config: NetworkConfig): Network {
    const rng = createRng(config.seed);
    const layers: Layer[] = [];
    const hiddenSizes = new Array(config.hiddenLayers).fill(config.neuronsPerLayer);
    const layerSizes = [config.inputSize, ...hiddenSizes, config.outputSize];

    for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex += 1) {
        const inSize = layerSizes[layerIndex];
        const outSize = layerSizes[layerIndex + 1];
        const scale = Math.sqrt(2 / inSize);
        const weights = Array.from({ length: inSize }, () =>
            Array.from({ length: outSize }, () => (rng() * 2 - 1) * scale)
        );
        const biases = Array.from({ length: outSize }, () => (rng() - 0.5) * 0.2);
        const activation: ActivationName =
            layerIndex === layerSizes.length - 2
                ? config.task === "classification"
                    ? "sigmoid"
                    : "linear"
                : config.activation;

        layers.push({ weights, biases, activation });
    }

    return {
        inputSize: config.inputSize,
        outputSize: config.outputSize,
        layers,
        inputMean: config.inputMean,
        inputStd: config.inputStd,
    };
}

export function forward(network: Network, input: number[]): ForwardPass {
    const activations: number[][] = [input];
    const preActivations: number[][] = [];

    let current = input;
    for (const layer of network.layers) {
        const z = new Array(layer.biases.length).fill(0);
        for (let j = 0; j < layer.biases.length; j += 1) {
            let sum = layer.biases[j];
            for (let i = 0; i < current.length; i += 1) {
                sum += current[i] * layer.weights[i][j];
            }
            z[j] = sum;
        }
        preActivations.push(z);
        const activationFn = ACTIVATIONS[layer.activation].fn;
        const a = z.map((value) => activationFn(value));
        activations.push(a);
        current = a;
    }

    return { activations, preActivations };
}

export function normalizeInput(network: Network, input: number[]): number[] {
    return input.map(
        (value, i) => (value - network.inputMean[i]) / network.inputStd[i]
    );
}

export function predict(network: Network, input: number[]): number[] {
    const normalized = normalizeInput(network, input);
    const pass = forward(network, normalized);
    return pass.activations[pass.activations.length - 1];
}
