import type {
    Dataset,
    DatasetDefinition,
    DatasetId,
    NormalizedDataset,
} from "./types";
import { createRng } from "./utils";

export const DATASET_OPTIONS: DatasetDefinition[] = [
    {
        id: "linear",
        name: "Linear Regression",
        task: "regression",
        inputSize: 1,
        outputSize: 1,
        description: "y = 2x + 1 + noise",
    },
    {
        id: "xor",
        name: "XOR Classification",
        task: "classification",
        inputSize: 2,
        outputSize: 1,
        description: "Nonlinear binary pattern",
    },
    {
        id: "and",
        name: "AND Classification",
        task: "classification",
        inputSize: 2,
        outputSize: 1,
        description: "Logical AND over two inputs",
    },
    {
        id: "or",
        name: "OR Classification",
        task: "classification",
        inputSize: 2,
        outputSize: 1,
        description: "Logical OR over two inputs",
    },
];

export function createDataset(id: DatasetId, seed: number): Dataset {
    const def = DATASET_OPTIONS.find((option) => option.id === id);
    if (!def) {
        throw new Error("Unknown dataset");
    }

    const rng = createRng(seed);
    const points = [] as Dataset["points"];

    if (id === "linear") {
        const count = 140;
        for (let i = 0; i < count; i += 1) {
            const x = rng() * 2 - 1;
            const noise = (rng() - 0.5) * 0.4;
            const y = 2 * x + 1 + noise;
            points.push({ x: [x], y: [y] });
        }
    } else {
        const count = 180;
        for (let i = 0; i < count; i += 1) {
            const x1 = rng();
            const x2 = rng();
            let label = 0;
            if (id === "xor") {
                label = x1 > 0.5 !== x2 > 0.5 ? 1 : 0;
            } else if (id === "and") {
                label = x1 > 0.5 && x2 > 0.5 ? 1 : 0;
            } else {
                label = x1 > 0.5 || x2 > 0.5 ? 1 : 0;
            }
            points.push({ x: [x1, x2], y: [label], label });
        }
    }

    return {
        ...def,
        points,
    };
}

export function normalizeDataset(dataset: Dataset): NormalizedDataset {
    const inputSize = dataset.inputSize;
    const mean = new Array(inputSize).fill(0);
    const std = new Array(inputSize).fill(0);

    for (const point of dataset.points) {
        for (let i = 0; i < inputSize; i += 1) {
            mean[i] += point.x[i];
        }
    }
    for (let i = 0; i < inputSize; i += 1) {
        mean[i] /= dataset.points.length;
    }

    for (const point of dataset.points) {
        for (let i = 0; i < inputSize; i += 1) {
            const diff = point.x[i] - mean[i];
            std[i] += diff * diff;
        }
    }
    for (let i = 0; i < inputSize; i += 1) {
        std[i] = Math.sqrt(std[i] / dataset.points.length) || 1e-6;
    }

    const normalized = dataset.points.map((point) => ({
        ...point,
        x: point.x.map((value, i) => (value - mean[i]) / std[i]),
    }));

    return {
        base: dataset,
        normalized,
        inputMean: mean,
        inputStd: std,
    };
}
