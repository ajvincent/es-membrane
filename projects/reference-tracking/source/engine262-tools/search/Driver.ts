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

import {
  SearchDriverInternal
} from "./Internal.js";

import {
  SearchDriverSummary
} from "./Summary.js";

export class SearchDriver
{
  #internal: SearchDriverInternal;
  #summary: SearchDriverSummary;
  #hasRun = false;

  constructor(
    targetValue: GuestEngine.Value,
    heldValues: readonly GuestEngine.Value[],
    strongReferencesOnly: boolean
  )
  {
    this.#internal = new SearchDriverInternal(targetValue, heldValues, strongReferencesOnly);
    this.#summary = new SearchDriverSummary;
  }

  public run(): ThrowOr<ReadonlyDeep<ReferenceGraph>> {
    if (!this.#hasRun) {
      this.#hasRun = true;
      this.#internal.run();
      this.#summary.run(this.#internal);
    }

    return this.#summary;
  }
}
