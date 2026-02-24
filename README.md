# Neural Network Playground

An interactive educational laboratory for studying how small feed-forward neural networks learn through gradient descent, implemented from first principles (without ML frameworks) and visualized in real time.

## Abstract

This project provides a browser-based environment to explore neural network training dynamics for both regression and binary classification. Users can configure architecture and hyperparameters, run single-epoch or multi-epoch training, and inspect model behavior through synchronized visual views of loss progression, learned decision surfaces, and network connectivity. The implementation emphasizes algorithmic transparency, reproducibility, and instructional clarity.

## Author

- **Name:** Emilio Bogantes
- **Email:** emilio.bogantes@professional.mit.edu

## Learning Objectives

- Understand forward propagation and nonlinear activations in multilayer perceptrons.
- Observe how backpropagation computes gradients and updates weights/biases.
- Compare optimization behavior across regression and classification tasks.
- Analyze effects of learning rate, architecture depth/width, and dataset structure.
- Build intuition for training stability, convergence, and overfitting risk.

## Technical Scope

### Core capabilities

- Dataset switching: `Linear`, `XOR`, `AND`, `OR`.
- Architecture controls: `0-2` hidden layers, configurable neurons per hidden layer.
- Activation controls: `ReLU`, `Sigmoid`, `Tanh` (hidden layers).
- Training modes: single-step update and multi-epoch run.
- Real-time metrics: epoch, loss, and classification accuracy.
- Visual analytics:
	- Directed network graph with weighted edges and gradient labels.
	- Loss curve over epochs.
	- Regression fit line or classification probability field.
- Integrated glossary for instructional terminology.

### ML implementation characteristics

- Pure TypeScript neural network implementation in `lib/nn/*`.
- Input normalization using per-feature mean/std before inference/training.
- Losses:
	- Regression: Mean Squared Error (MSE)
	- Classification: Binary Cross-Entropy (BCE)
- Gradient descent with bounded learning rate and numerically safe updates.

## System Architecture

### Frontend stack

- `Next.js 16` (App Router)
- `React 19`
- `TypeScript 5`
- `Tailwind CSS 4`

### Visualization stack

- `@xyflow/react` for network topology and weighted-edge rendering.
- `recharts` for loss trajectory and dataset prediction charts.

### Key modules

- `app/page.tsx`: orchestration layer for UI state, training loop, and interaction flow.
- `components/ControlsPanel.tsx`: configuration and metrics controls.
- `components/NetworkFlow.tsx`: model topology visualization.
- `components/LossChart.tsx`: epoch-loss trend visualization.
- `components/DataPlot.tsx`: regression/classification output rendering.
- `lib/nn/network.ts`: model construction, forward pass, prediction path.
- `lib/nn/training.ts`: epoch training, gradient accumulation, parameter updates.
- `lib/nn/datasets.ts`: deterministic synthetic dataset generation and normalization.

## Reproducibility & Determinism

- Controlled random seed for model initialization and dataset generation.
- Repeatable synthetic dataset construction by task family.
- Deterministic training behavior under constant configuration.

## Accessibility & UX Notes

- Keyboard-visible focus outlines for interactive controls.
- Readable typography and contrast-oriented color tokens.
- Guided interaction model: initialize → step → train.
- Intuition vs. formal explanation mode for pedagogical flexibility.

## Privacy and Indexing Policy

This site is configured as **non-indexable**:

- Metadata robots policy sets `noindex, nofollow`.
- `robots.txt` disallows crawling for all user agents.

This makes the project suitable for internal demos, coursework, or private preview deployments.

## Requirements

- Node.js `>=20.9.0`
- npm `>=10` (recommended)

## Local Development

```bash
npm install
npm run dev
```

Application URL:

- http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Use default Next.js build settings.
4. Ensure runtime uses Node.js `20.9+`.

## Project Structure

```text
app/
	layout.tsx        # Global metadata, fonts, robots directives
	page.tsx          # Main interactive lab view
components/
	ControlsPanel.tsx # Hyperparameters, dataset and metric controls
	NetworkFlow.tsx   # Neural graph visualization
	LossChart.tsx     # Loss-over-time chart
	DataPlot.tsx      # Dataset + prediction rendering
lib/nn/
	activations.ts    # Activation functions and derivatives
	datasets.ts       # Synthetic datasets + normalization
	loss.ts           # MSE/BCE losses
	network.ts        # Model definition + forward path
	training.ts       # Backpropagation and parameter updates
	types.ts          # Domain models and interfaces
```

## Limitations

- Intended for pedagogy and experimentation, not large-scale training.
- Supports small dense feed-forward networks only.
- No persistence layer for sessions/models.
- No distributed or accelerated training backend.

## License

MIT License. See [LICENSE](LICENSE).
