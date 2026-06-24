import type {
  Edge
} from "@dagrejs/graphlib";

import type {
  SearchGraph
} from "./runSearchesInGuestEngine.js";

export type PathsArray = readonly (readonly Record<"v" | "w" | "name", string>[])[];

export function pathsToTarget(
  graph: SearchGraph | null
): PathsArray
{
  if (graph === null || graph.nodeCount() === 0)
    return [];

  const traversal = new GraphTraversal(graph);
  const values: (readonly Required<Edge>[])[] = Array.from(traversal.getPaths());

  values.sort(EdgeImpl.comparator);
  return values;
}

class GraphTraversal {
  readonly #graph: SearchGraph;
  readonly #currentNodeStack = new Set<string>;
  readonly #currentStack: EdgeImpl[] = [];

  /* We could speed things up by memoizing paths from each visited node to the target,
  and then concatting them with an existing path leading to a visited node.
  We're dealing for O(n^2 * m) for n nodes and m edges... as long as n and m remain small,
  we're probably okay.
  */

  constructor(graph: SearchGraph) {
    this.#graph = graph;
  }

  * getPaths(): Iterable<readonly Required<Edge>[]> {
    yield * this.#yieldPaths("heldValues:1");
  }

  * #yieldPaths(
    nextNodeId: string
  ): IterableIterator<readonly Required<Edge>[]>
  {
    this.#currentNodeStack.add(nextNodeId);

    for (const edge of this.#graph.outEdges(nextNodeId)!) {
      const next = new EdgeImpl(edge);
      this.#currentStack.push(next);

      const { w } = edge;

      if (w === "target:0") {
        yield this.#currentStack.map(e => e.cloneWithRegistration());
      }
      else {
        if (this.#currentNodeStack.has(w) === false)
          yield * this.#yieldPaths(w);
      }

      this.#currentStack.pop();
    }

    this.#currentNodeStack.delete(nextNodeId);
  }
}

class EdgeImpl implements Required<Edge> {
  readonly v: string;
  readonly w: string;
  readonly name: string;

  static readonly #edgeMap = new WeakMap<Edge, number>;

  static comparator(
    this: void,
    a: readonly Edge[],
    b: readonly Edge[]
  ): number
  {
    let diff = a.length - b.length;
    for (let i = 0; diff === 0 && i < a.length; i++) {
      const aIndex = EdgeImpl.#edgeMap.get(a[i])!, bIndex = EdgeImpl.#edgeMap.get(b[i])!;
      diff = aIndex - bIndex;
    }
    return diff;
  }

  constructor(edge: Edge) {
    this.v = edge.v;
    this.w = edge.w;
    this.name = edge.name!;
  }

  cloneWithRegistration(): Required<Edge> {
    const { v, w, name } = this;
    const clone: Required<Edge> = { v, w, name };
    EdgeImpl.#edgeMap.set(clone, parseInt(/:(\d+)$/.exec(clone.v)![1]));
    return clone;
  }
}
