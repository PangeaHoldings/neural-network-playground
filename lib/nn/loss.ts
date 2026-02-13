import type { TaskType } from "./types";

export function mseLoss(pred: number[], target: number[]): number {
    let sum = 0;
    for (let i = 0; i < pred.length; i += 1) {
        const diff = pred[i] - target[i];
        sum += diff * diff;
    }
    return sum / pred.length;
}

export function bceLoss(pred: number[], target: number[]): number {
    let sum = 0;
    for (let i = 0; i < pred.length; i += 1) {
        const p = Math.min(1 - 1e-7, Math.max(1e-7, pred[i]));
        const y = target[i];
        sum += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    }
    return sum / pred.length;
}

export function computeLoss(task: TaskType, pred: number[], target: number[]): number {
    return task === "regression" ? mseLoss(pred, target) : bceLoss(pred, target);
}
