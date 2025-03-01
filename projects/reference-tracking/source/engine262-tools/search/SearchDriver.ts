//#region preamble
import type {
  Graph
} from "@dagrejs/graphlib";

import {
  GuestEngine,
  type ThrowOr,
} from "../host-to-guest/GuestEngine.js";

import {
  ObjectGraphImpl
} from "../../graph-analysis/ObjectGraphImpl.js";

import type {
  CloneableGraphIfc
} from "../../graph-analysis/types/CloneableGraphIfc.js";

import type {
  SearchReferencesIfc
} from "../../graph-analysis/types/SearchReferencesIfc.js";

import {
  GuestObjectGraphImpl
} from "./GuestObjectGraphImpl.js";
//#endregion preamble

export class SearchDriver
{
  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #guestObjectGraph: GuestObjectGraphImpl<null, null>;
  readonly #cloneableGraph: CloneableGraphIfc;
  readonly #searchReferences: SearchReferencesIfc;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#realm = realm;

    const hostGraphImpl = new ObjectGraphImpl<null, null>;
    this.#guestObjectGraph = new GuestObjectGraphImpl(hostGraphImpl);
    this.#guestObjectGraph.defineTargetAndHeldValues(targetValue, null, heldValues, null);

    this.#cloneableGraph = hostGraphImpl;
    this.#searchReferences = hostGraphImpl;
  }

  public run(): ThrowOr<Graph | null>
  {
    void(this.#strongReferencesOnly);
    void(this.#realm);
    void(this.#cloneableGraph);
    void(this.#searchReferences);
    return null;
  }
}
