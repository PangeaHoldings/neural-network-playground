"use client";

import { type MouseEvent, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Gradients, Network, TaskType } from "@/lib/nn/types";

interface NetworkFlowProps {
  network: Network | null;
  task: TaskType;
  gradients: Gradients | null;
  isFlowing: boolean;
  highlight: boolean;
  frozenLayers: boolean[];
}

interface WeightedEdgeData extends Record<string, unknown> {
  weight: number;
  gradient: number | null;
  showLabel: boolean;
  isUpdated: boolean;
  isFlowing: boolean;
}

type LayerNodeData = {
  label: string;
  kind: "input" | "hidden" | "output";
  pulse: boolean;
};

type LayerNode = Node<LayerNodeData, "layerNode">;
type WeightedEdge = Edge<WeightedEdgeData, "weighted">;

function LayerNode({ data }: NodeProps<LayerNode>) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full border text-xs font-semibold ${
        data.kind === "input"
          ? "border-black bg-white"
          : data.kind === "output"
          ? "border-(--mit-red) bg-(--mit-red) text-white"
          : "border-(--mit-gray-200) bg-(--mit-gray-50)"
      } ${data.pulse ? "node-pulse" : ""}`}
    >
      {data.label}
    </div>
  );
}

function WeightedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style,
}: EdgeProps<WeightedEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  if (!data) {
    return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        className={data.isFlowing ? "edge-flow" : ""}
      />
      {data.showLabel ? (
        <EdgeLabelRenderer>
          <div
            className="rounded-md border border-(--mit-gray-200) bg-white px-2 py-1 text-xs text-black shadow"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            w: {data.weight.toFixed(3)}
            {data.gradient !== null ? `, g: ${data.gradient.toFixed(3)}` : ""}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

const nodeTypes = { layerNode: LayerNode };
const edgeTypes = { weighted: WeightedEdge };

export default function NetworkFlow({
  network,
  task,
  gradients,
  isFlowing,
  highlight,
  frozenLayers,
}: NetworkFlowProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (!network) {
      return { nodes: [] as LayerNode[], edges: [] as WeightedEdge[] };
    }

    const layerSizes = [
      network.inputSize,
      ...network.layers.slice(0, -1).map((layer) => layer.biases.length),
      network.outputSize,
    ];

    const nodesList: LayerNode[] = [];
    const edgesList: WeightedEdge[] = [];

    const totalNodes = layerSizes.reduce((sum, size) => sum + size, 0);
    const maxLayerSize = Math.max(...layerSizes);
    const isCompactNetwork = totalNodes <= 8 && maxLayerSize <= 4;
    const columnGap = isCompactNetwork ? 260 : 200;
    const rowGap = isCompactNetwork ? 120 : 100;

    layerSizes.forEach((size, layerIndex) => {
      for (let i = 0; i < size; i += 1) {
        nodesList.push({
          id: `L${layerIndex}N${i}`,
          type: "layerNode",
          position: {
            x: layerIndex * columnGap,
            y: i * rowGap - ((size - 1) * rowGap) / 2,
          },
          data: {
            label:
              layerIndex === 0
                ? `x${i + 1}`
                : layerIndex === layerSizes.length - 1
                ? task === "classification"
                  ? "p"
                  : "y"
                : `h${i + 1}`,
            kind:
              layerIndex === 0
                ? "input"
                : layerIndex === layerSizes.length - 1
                ? "output"
                : "hidden",
            pulse: isFlowing || highlight,
          },
        });
      }
    });

    network.layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.weights.length; i += 1) {
        for (let j = 0; j < layer.weights[i].length; j += 1) {
          const weight = layer.weights[i][j];
          const gradient = gradients?.weightGrads[layerIndex]?.[i]?.[j] ?? null;
          const edgeId = `E${layerIndex}-${i}-${j}`;
          const weightStrength = Math.min(5, Math.abs(weight) * 3 + 0.8);
          const positive = weight >= 0;
          const isFrozen = frozenLayers[layerIndex] ?? false;
          const strokeColor = isFrozen
            ? "var(--mit-gray-200)"
            : highlight
            ? "var(--mit-bright-red)"
            : positive
            ? "var(--mit-red)"
            : "var(--mit-gray)";
          const strokeDasharray = isFrozen
            ? "2 6"
            : positive
            ? undefined
            : "6 4";

          edgesList.push({
            id: edgeId,
            source: `L${layerIndex}N${i}`,
            target: `L${layerIndex + 1}N${j}`,
            type: "weighted",
            data: {
              weight,
              gradient,
              showLabel: hoveredEdge === edgeId,
              isUpdated: highlight,
              isFlowing,
            },
            style: {
              stroke: strokeColor,
              strokeWidth: weightStrength,
              strokeDasharray,
              opacity: isFrozen ? 0.55 : 1,
            },
          });
        }
      }
    });

    return { nodes: nodesList, edges: edgesList };
  }, [network, gradients, task, hoveredEdge, isFlowing, highlight, frozenLayers]);

  if (!network) {
    return (
      <div className="card-panel flex h-full min-h-64 items-center justify-center rounded-2xl p-6 text-center text-sm text-(--mit-gray-700)">
        Click Initialize to create a model and see the network diagram.
      </div>
    );
  }

  return (
    <div className="card-panel relative h-full min-h-64 overflow-hidden rounded-2xl p-3">
      <div className="absolute left-4 top-4 z-10 hidden rounded-xl bg-white/95 px-3 py-2 text-xs text-(--mit-gray-700) shadow sm:block">
        <div className="text-black">Legend</div>
        <div>Thicker edge = stronger weight</div>
        <div>Red = positive, Gray dashed = negative</div>
        <div>Pale dashed = frozen layer</div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 0.85 }}
        minZoom={0.35}
        maxZoom={1}
        panOnScroll
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onEdgeMouseEnter={(_event: MouseEvent, edge: WeightedEdge) =>
          setHoveredEdge(edge.id)
        }
        onEdgeMouseLeave={() => setHoveredEdge(null)}
      >
        <Background gap={28} color="var(--mit-gray-200)" />
      </ReactFlow>
    </div>
  );
}
