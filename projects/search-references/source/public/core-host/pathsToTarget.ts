import {
  alg,
} from "@dagrejs/graphlib";

import type {
  SearchGraph
} from "./runSearchesInGuestEngine.js";

export interface NodeAndEdgeLabels {
  nodeIndex: number;
  nextEdgeLabel?: string;
}

class NodeAndEdge {
  static comparator(this: void, a: readonly NodeAndEdgeLabels[], b: readonly NodeAndEdgeLabels[]): number {
    let diff = a.length - b.length;
    for (let i = 0; diff === 0 && i < a.length; i++) {
      const aIndex = a[i].nodeIndex, bIndex = b[i].nodeIndex;
      diff = aIndex - bIndex;
    }
    return diff;
  }

  nodeIndex: number;
  nextEdgeLabel?: string;

  constructor(nodeIndex: number) {
    this.nodeIndex = nodeIndex;
  }

  clone(): NodeAndEdgeLabels {
    const { nodeIndex, nextEdgeLabel } = this;
    return nextEdgeLabel === undefined ? { nodeIndex } : { nodeIndex, nextEdgeLabel };
  }
}

export function pathsToTarget(graph: SearchGraph | null): readonly (readonly NodeAndEdgeLabels[])[] {
  if (graph === null)
    return [];

  if (alg.isAcyclic(graph) === false)
    throw new Error("graph has a cycle");
  const nodeStack: NodeAndEdge[] = [];
  const values: (readonly NodeAndEdgeLabels[])[] = Array.from(yieldPaths(graph, "heldValues:1", nodeStack));
  values.sort(NodeAndEdge.comparator);
  return values;
}

function * yieldPaths(graph: SearchGraph, nextNodeId: string, stack: NodeAndEdge[]): Iterable<readonly NodeAndEdgeLabels[]> {
  const id = parseInt(/:(\d+)$/.exec(nextNodeId)![1]);
  const next = new NodeAndEdge(id);
  stack.push(next);

  if (nextNodeId === "target:0") {
    const result: NodeAndEdgeLabels[] = stack.map(n => n.clone());
    result.shift();
    yield result;
  }
  else {
    for (const edge of graph.outEdges(nextNodeId)!) {
      const edgeLabel = graph.edge(edge);
      next.nextEdgeLabel = edgeLabel.label;
      yield * yieldPaths(graph, edge.w, stack);
      next.nextEdgeLabel = undefined;
    }
  }
  stack.pop();
}
