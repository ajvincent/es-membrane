import type {
  SearchGraph
} from "./runSearchesInGuestEngine.js";

export interface NodeAndEdgeLabels {
  nodeIndex: number;
  nextEdgeLabel?: string;
}

export function pathsToTarget(
  graph: SearchGraph | null
): readonly (readonly NodeAndEdgeLabels[])[]
{
  if (graph === null || graph.nodeCount() === 0)
    return [];

  const traversal = new GraphTraversal(graph);
  const values: (readonly NodeAndEdgeLabels[])[] = Array.from(traversal.getPaths());

  values.sort(NodeAndEdge.comparator);
  return values;
}

class GraphTraversal {
  readonly #graph: SearchGraph;
  readonly #currentNodeStack = new Set<string>;
  readonly #currentStack: NodeAndEdge[] = [];

  /* We could speed things up by memoizing paths from each visited node to the target,
  and then concatting them with an existing path leading to a visited node.
  We're dealing for O(n^2 * m) for n nodes and m edges... as long as n and m remain small,
  we're probably okay.
  */

  constructor(graph: SearchGraph) {
    this.#graph = graph;
  }

  * getPaths(): Iterable<readonly NodeAndEdgeLabels[]> {
    yield * this.#yieldPaths("heldValues:1");
  }

  * #yieldPaths(
    nextNodeId: string
  ): IterableIterator<readonly NodeAndEdgeLabels[]>
  {
    const id = parseInt(/:(\d+)$/.exec(nextNodeId)![1]);
    const next = new NodeAndEdge(id);

    this.#currentNodeStack.add(nextNodeId);
    this.#currentStack.push(next);

    if (nextNodeId === "target:0") {
      const result: NodeAndEdgeLabels[] = this.#currentStack.map(n => n.clone());
      result.shift();
      yield result;
    }
    else {
      for (const edge of this.#graph.outEdges(nextNodeId)!) {
        if (this.#currentNodeStack.has(edge.w))
          continue;

        const edgeLabel = this.#graph.edge(edge);
        next.nextEdgeLabel = edgeLabel.label;
        yield * this.#yieldPaths(edge.w);
        next.nextEdgeLabel = undefined;
      }
    }

    this.#currentStack.pop();
    this.#currentNodeStack.delete(nextNodeId);
  }
}

class NodeAndEdge implements NodeAndEdgeLabels {
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
