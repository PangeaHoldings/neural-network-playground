"use client";

import { useState } from "react";

export default function ExplainPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="card-panel rounded-2xl p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">Academic notes</h3>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="text-xs font-semibold text-(--mit-red)"
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </header>
      {open ? (
        <div className="mt-4 grid gap-3 text-sm text-(--mit-gray-700) md:grid-cols-2">
          <p>
            <span className="font-semibold text-black">Weights</span> scale how
            strongly each input influences a neuron.
          </p>
          <p>
            <span className="font-semibold text-black">Bias</span> shifts the
            activation so neurons can learn non-zero thresholds.
          </p>
          <p>
            <span className="font-semibold text-black">Activation</span> adds
            nonlinearity so the network can model curved patterns.
          </p>
          <p>
            <span className="font-semibold text-black">Gradient</span> is the
            slope of loss with respect to a weight, used to update it.
          </p>
          <p>
            <span className="font-semibold text-black">Learning rate</span>
            controls how big each update step is.
          </p>
          <p>
            <span className="font-semibold text-black">Normalization</span>
            keeps inputs on a similar scale to stabilize learning.
          </p>
          <p>
            <span className="font-semibold text-black">Loss choice</span> is MSE
            for regression and BCE for classification.
          </p>
          <p>
            <span className="font-semibold text-black">Overfitting</span>
            happens when the model memorizes small datasets instead of
            generalizing.
          </p>
        </div>
      ) : null}
    </section>
  );
}
