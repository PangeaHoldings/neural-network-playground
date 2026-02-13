# Neural Network Playground

An interactive, MIT-styled learning tool that demonstrates a small neural network's forward pass and training loop. Learners can adjust the architecture, step through backpropagation, and watch loss decrease on real synthetic datasets.

## What this app teaches

- How weights and biases shape signal flow
- How loss quantifies error for regression and classification
- How backpropagation computes gradients for learning
- Why normalization and learning rate affect stability
- How small datasets can lead to overfitting

## Key features

- Dataset switcher (Linear, XOR, AND, OR)
- Adjustable architecture (0-2 hidden layers, 1-8 neurons)
- Real forward pass + backprop (no ML frameworks)
- Live loss chart and data plot
- React Flow visualization with weight sign and magnitude

## Accessibility

- AA-friendly contrast for secondary text
- Keyboard focus outlines on interactive elements
- Minimum readable font sizes for labels

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo and accept the default Next.js settings.
3. Deploy.

## Share your deployed link

After deployment, paste the public Vercel URL here:

```
<PASTE_PUBLIC_URL_HERE>
```

## License

MIT License. See [LICENSE](LICENSE).
