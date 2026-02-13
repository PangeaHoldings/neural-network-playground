import Link from "next/link";

const TERMS = [
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
    meaning:
      "One full pass over the training dataset during learning.",
  },
  {
    term: "Forward pass",
    meaning:
      "The computation that produces model outputs from inputs using current weights.",
  },
  {
    term: "Gradient",
    meaning:
      "A slope value showing how the loss changes when a weight changes.",
  },
  {
    term: "Learning rate",
    meaning:
      "A step size that scales how much weights change during gradient descent.",
  },
  {
    term: "Loss",
    meaning:
      "A measure of how wrong the model's predictions are on average.",
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
    meaning:
      "The model output for a given input after a forward pass.",
  },
  {
    term: "Sigmoid",
    meaning:
      "An activation function that maps values to the range 0 to 1.",
  },
  {
    term: "Tanh",
    meaning:
      "An activation function that maps values to the range -1 to 1.",
  },
  {
    term: "ReLU",
    meaning:
      "An activation function that outputs zero for negative inputs and the input itself otherwise.",
  },
  {
    term: "Weight",
    meaning:
      "A learned parameter that scales how much an input contributes to a neuron.",
  },
];

export default function GlossaryPage() {
  return (
    <div className="h-screen bg-(--mit-gray-50)">
      <main className="mx-auto flex h-full w-full max-w-none flex-col gap-6 px-4 py-6 lg:px-10">
        <header className="flex shrink-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-(--mit-gray-700)">
                Reference
              </span>
              <h1 className="text-3xl font-semibold text-black md:text-4xl">
                Neural Network Glossary
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-(--mit-gray-200) px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
            >
              Back to Playground
            </Link>
          </div>
          <p className="max-w-3xl text-base text-(--mit-gray-700)">
            Plain-language definitions of the terms used throughout the
            playground.
          </p>
        </header>

        <section className="card-panel min-h-0 flex-1 overflow-auto rounded-2xl p-6">
          <dl className="grid gap-4 md:grid-cols-2">
            {TERMS.map((item) => (
              <div
                key={item.term}
                className="rounded-xl border border-(--mit-gray-200) bg-white p-4"
              >
                <dt className="text-sm font-semibold text-black">{item.term}</dt>
                <dd className="mt-2 text-sm text-(--mit-gray-700)">
                  {item.meaning}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
