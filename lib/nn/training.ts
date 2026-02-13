import type {
    Gradients,
    Network,
    NormalizedDataset,
    TaskType,
    TrainResult,
} from "./types";
import { ACTIVATIONS } from "./activations";
import { computeLoss } from "./loss";
import { clamp, isFiniteNumber } from "./utils";
import { forward } from "./network";

function createZeroGradients(network: Network): Gradients {
    const weightGrads = network.layers.map((layer) =>
        layer.weights.map((row) => row.map(() => 0))
    );
    const biasGrads = network.layers.map((layer) =>
        layer.biases.map(() => 0)
    );

    return { weightGrads, biasGrads };
}

export function trainEpoch(
    network: Network,
    dataset: NormalizedDataset,
    task: TaskType,
    learningRate: number
): TrainResult {
    const lr = clamp(learningRate, 0.001, 1);
    const grads = createZeroGradients(network);
    let lossSum = 0;
    let correct = 0;

    for (const point of dataset.normalized) {
        const pass = forward(network, point.x);
        const activations = pass.activations;
        const preActivations = pass.preActivations;
        const output = activations[activations.length - 1];

        lossSum += computeLoss(task, output, point.y);
        if (task === "classification") {
            const predicted = output[0] >= 0.5 ? 1 : 0;
            if (predicted === point.y[0]) {
                correct += 1;
            }
        }

        const deltas: number[][] = new Array(network.layers.length).fill(0).map(() => []);
        const lastLayerIndex = network.layers.length - 1;

        for (let j = 0; j < output.length; j += 1) {
            const error = output[j] - point.y[j];
            const z = preActivations[lastLayerIndex][j];
            const activation = network.layers[lastLayerIndex].activation;
            const deriv = ACTIVATIONS[activation].deriv(z);
            deltas[lastLayerIndex][j] =
                task === "classification" ? error : 2 * error * deriv;
        }

        for (let layerIndex = lastLayerIndex - 1; layerIndex >= 0; layerIndex -= 1) {
            const currentLayer = network.layers[layerIndex];
            const nextLayer = network.layers[layerIndex + 1];
            const currentDelta = new Array(currentLayer.biases.length).fill(0);

            for (let i = 0; i < currentLayer.biases.length; i += 1) {
                let sum = 0;
                for (let j = 0; j < nextLayer.biases.length; j += 1) {
                    sum += deltas[layerIndex + 1][j] * nextLayer.weights[i][j];
                }
                const z = preActivations[layerIndex][i];
                const deriv = ACTIVATIONS[currentLayer.activation].deriv(z);
                currentDelta[i] = sum * deriv;
            }
            deltas[layerIndex] = currentDelta;
        }

        for (let layerIndex = 0; layerIndex < network.layers.length; layerIndex += 1) {
            const inputActivations = activations[layerIndex];
            const layerDelta = deltas[layerIndex];

            for (let i = 0; i < inputActivations.length; i += 1) {
                for (let j = 0; j < layerDelta.length; j += 1) {
                    grads.weightGrads[layerIndex][i][j] +=
                        inputActivations[i] * layerDelta[j];
                }
            }

            for (let j = 0; j < layerDelta.length; j += 1) {
                grads.biasGrads[layerIndex][j] += layerDelta[j];
            }
        }
    }

    const batchSize = dataset.normalized.length || 1;
    for (let layerIndex = 0; layerIndex < network.layers.length; layerIndex += 1) {
        const layer = network.layers[layerIndex];
        for (let i = 0; i < layer.weights.length; i += 1) {
            for (let j = 0; j < layer.weights[i].length; j += 1) {
                const grad = grads.weightGrads[layerIndex][i][j] / batchSize;
                const updated = layer.weights[i][j] - lr * grad;
                if (isFiniteNumber(updated)) {
                    layer.weights[i][j] = updated;
                }
            }
        }
        for (let j = 0; j < layer.biases.length; j += 1) {
            const grad = grads.biasGrads[layerIndex][j] / batchSize;
            const updated = layer.biases[j] - lr * grad;
            if (isFiniteNumber(updated)) {
                layer.biases[j] = updated;
            }
        }
    }

    const loss = lossSum / batchSize;
    const accuracy = task === "classification" ? correct / batchSize : undefined;

    return { network, loss, accuracy, gradients: grads };
}
