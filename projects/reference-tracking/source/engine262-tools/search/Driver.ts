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
import SearchDriverSummary from "./DriverSummary.js";

export class SearchDriver
{
  #topDownSearchForTarget?: TopDownSearchForTarget;
  #summary: SearchDriverSummary;
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
    this.#summary = new SearchDriverSummary;
  }

  public run(): ThrowOr<ReadonlyDeep<ReferenceGraph>> {
    if (!this.#hasRun) {
      this.#hasRun = true;
      try {
        const result = this.#topDownSearchForTarget!.run();
        if (result instanceof GuestEngine.ThrowCompletion)
          return result;
        this.#summary.run(this.#topDownSearchForTarget!);
      } finally {
        this.#topDownSearchForTarget = undefined;
      }
    }

    return this.#summary;
  }
}
