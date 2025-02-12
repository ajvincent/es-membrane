import type {
  ReadonlyDeep,
} from "type-fest";

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import type {
  ReferenceGraph,
} from "../../ReferenceGraph.js";

import TopDownSearchForTarget from "./TopDownSearchForTarget.js";
import BottomUpSearchForChildEdges from "./BottomUpSearchForChildEdges.js";

export class SearchDriver
{
  #topDownSearchForTarget?: TopDownSearchForTarget;
  #bottomUpSearchForEdges?: BottomUpSearchForChildEdges;
  #hasRun = false;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#topDownSearchForTarget = new TopDownSearchForTarget(
      targetValue, heldValues, strongReferencesOnly, realm
    );
  }

  public run(): ThrowOr<ReadonlyDeep<ReferenceGraph> | undefined> {
    let graph: ReadonlyDeep<ReferenceGraph>;

    if (!this.#hasRun) {
      this.#hasRun = true;

      try {
        const result = this.#topDownSearchForTarget!.run();
        if (result instanceof GuestEngine.ThrowCompletion)
          return result;
        this.#bottomUpSearchForEdges = new BottomUpSearchForChildEdges(this.#topDownSearchForTarget!);
        this.#bottomUpSearchForEdges.run();
        graph = this.#bottomUpSearchForEdges.bottomUpGraph;
      } finally {
        this.#topDownSearchForTarget = undefined;
        this.#bottomUpSearchForEdges = undefined;
      }

      return graph;
    }
  }
}
