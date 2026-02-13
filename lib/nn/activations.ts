import type { ActivationName } from "./types";

export interface ActivationFn {
    fn: (x: number) => number;
    deriv: (x: number) => number;
}

export const ACTIVATIONS: Record<ActivationName, ActivationFn> = {
    relu: {
        fn: (x) => (x > 0 ? x : 0),
        deriv: (x) => (x > 0 ? 1 : 0),
    },
    sigmoid: {
        fn: (x) => 1 / (1 + Math.exp(-x)),
        deriv: (x) => {
            const s = 1 / (1 + Math.exp(-x));
            return s * (1 - s);
        },
    },
    tanh: {
        fn: (x) => Math.tanh(x),
        deriv: (x) => {
            const t = Math.tanh(x);
            return 1 - t * t;
        },
    },
    linear: {
        fn: (x) => x,
        deriv: () => 1,
    },
};
