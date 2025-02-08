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

import SearchDriverInternal from "./DriverInternal.js";
import SearchDriverSummary from "./DriverSummary.js";

export class SearchDriver
{
  #internal?: SearchDriverInternal;
  #summary: SearchDriverSummary;
  #hasRun = false;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#internal = new SearchDriverInternal(
      targetValue, heldValues, strongReferencesOnly, realm
    );
    this.#summary = new SearchDriverSummary;
  }

  public run(): ThrowOr<ReadonlyDeep<ReferenceGraph>> {
    if (!this.#hasRun) {
      this.#hasRun = true;
      try {
        this.#internal!.run();
        this.#summary.run(this.#internal!);
      } finally {
        this.#internal = undefined;
      }
    }

    return this.#summary;
  }
}
