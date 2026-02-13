export type TaskType = "regression" | "classification";
export type DatasetId = "linear" | "xor" | "and" | "or";
export type ActivationName = "relu" | "sigmoid" | "tanh" | "linear";

export interface DataPoint {
    x: number[];
    y: number[];
    label?: number;
}

export interface DatasetDefinition {
    id: DatasetId;
    name: string;
    task: TaskType;
    inputSize: number;
    outputSize: number;
    description: string;
}

export interface Dataset extends DatasetDefinition {
    points: DataPoint[];
}

export interface NormalizedDataset {
    base: Dataset;
    normalized: DataPoint[];
    inputMean: number[];
    inputStd: number[];
}

export interface Layer {
    weights: number[][];
    biases: number[];
    activation: ActivationName;
}

export interface Network {
    inputSize: number;
    outputSize: number;
    layers: Layer[];
    inputMean: number[];
    inputStd: number[];
}

export interface Gradients {
    weightGrads: number[][][];
    biasGrads: number[][];
}

export interface TrainResult {
    network: Network;
    loss: number;
    accuracy?: number;
    gradients: Gradients;
}
