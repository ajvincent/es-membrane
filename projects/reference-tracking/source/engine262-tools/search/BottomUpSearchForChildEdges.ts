import {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
  TARGET_NODE_KEY,
  PRESUMED_HELD_NODE_KEY,
} from "../../ReferenceGraph.js";

import {
  ReferenceGraphImpl
} from "./ReferenceGraphImpl.js";

export class BottomUpSearchForChildEdges {
  public static sortBottomUpGraphArrays(graph: ReferenceGraphImpl): void {
    graph.nodes.sort(
      BottomUpSearchForChildEdges.#nodeComparator
    );
    graph.parentToChildEdges.sort(
      BottomUpSearchForChildEdges.#parentEdgeComparator
    );
    graph.childToParentEdges.sort(
      BottomUpSearchForChildEdges.#childEdgeComparator
    );
  }

  static #nodeComparator(
    a: ReferenceGraphNode,
    b: ReferenceGraphNode,
  ): number
  {
    return a.objectKey - b.objectKey;
  }

  static #parentEdgeComparator(
    a: ParentToChildReferenceGraphEdge,
    b: ParentToChildReferenceGraphEdge,
  ): number
  {
    return a.parentObjectKey - b.parentObjectKey;
  }

  static #childEdgeComparator(
    a: ChildToParentReferenceGraphEdge,
    b: ChildToParentReferenceGraphEdge
  ): number
  {
    return a.childObjectKey - b.childObjectKey;
  }

  readonly #topDownGraph: ReferenceGraph;
  readonly bottomUpGraph = new ReferenceGraphImpl;

  readonly #childEdgesByChildKey = new Map<number, ChildToParentReferenceGraphEdge[]>
  readonly #nodesMap = new Map<number, ReferenceGraphNode>;
  readonly #parentEdgesByEdgeId = new Map<number, ParentToChildReferenceGraphEdge>;
  readonly #nodeIdsAccepted = new Set<number>;

  #foundHeldValues = false;

  constructor(topDownGraph: ReferenceGraph) {
    this.#topDownGraph = topDownGraph;
  }

  run(): void
  {
    if (this.#topDownGraph.succeeded === false)
      return;
    this.bottomUpGraph.succeeded = true;
    this.bottomUpGraph.foundTargetValue = this.#topDownGraph.foundTargetValue;
    if (this.bottomUpGraph.foundTargetValue === false)
      return;

    this.#fillMaps();
    this.#nodeIdsAccepted.add(TARGET_NODE_KEY);

    for (const id of this.#nodeIdsAccepted) {
      this.#addNode(id);
    }

    this.bottomUpGraph.succeeded = this.#foundHeldValues;
    if (this.#foundHeldValues) {
      BottomUpSearchForChildEdges.sortBottomUpGraphArrays(this.bottomUpGraph);
    }
  }

  #fillMaps(): void {
    for (const node of this.#topDownGraph.nodes) {
      this.#nodesMap.set(node.objectKey, node);
    }

    for (const edge of this.#topDownGraph.parentToChildEdges) {
      this.#parentEdgesByEdgeId.set(edge.parentToChildEdgeId, edge);
    }

    for (const edge of this.#topDownGraph.childToParentEdges) {
      let collectedEdges: ChildToParentReferenceGraphEdge[] | undefined = this.#childEdgesByChildKey.get(edge.childObjectKey);
      if (!collectedEdges) {
        collectedEdges = [];
        this.#childEdgesByChildKey.set(edge.childObjectKey, collectedEdges);
      }
      collectedEdges.push(edge);
    }
  }

  #addNode(childObjectKey: number) {
    this.bottomUpGraph.nodes.push(this.#nodesMap.get(childObjectKey)!);
    if (childObjectKey === PRESUMED_HELD_NODE_KEY) {
      this.#foundHeldValues = true;
      return;
    }

    const collectedEdges: ChildToParentReferenceGraphEdge[] = this.#childEdgesByChildKey.get(childObjectKey)!;
    this.bottomUpGraph.childToParentEdges.push(...collectedEdges);

    for (const edge of collectedEdges) {
      const { parentToChildEdgeId, jointOwnerKeys } = edge;
      this.bottomUpGraph.parentToChildEdges.push(
        this.#parentEdgesByEdgeId.get(parentToChildEdgeId)!
      );

      for (const ownerKey of jointOwnerKeys) {
        this.#nodeIdsAccepted.add(ownerKey);
      }
    }
  }
}
