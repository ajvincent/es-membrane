import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge
} from "../../ReferenceGraph.js";

import ReferenceGraphNodeImpl from "./ReferenceGraphNodeImpl.js";

import {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

export class SearchDriverInternal implements ReadonlyDeep<ReferenceGraph> {
  static readonly #targetValueKey = 0;
  static readonly #heldValuesKey = 1;

  readonly #targetValue: GuestEngine.ObjectValue;
  readonly #heldValues: GuestEngine.ObjectValue;
  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #valueToNumericKeyMap = new ValueToNumericKeyMap;

  readonly #nodes: ReferenceGraphNode[] = [];
  readonly #parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  readonly #childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  readonly nodes: readonly ReferenceGraphNode[] = this.#nodes;
  readonly parentToChildEdges: readonly ParentToChildReferenceGraphEdge[] = this.#parentToChildEdges;
  readonly childToParentEdges: readonly ChildToParentReferenceGraphEdge[] = this.#childToParentEdges;

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#targetValue = targetValue;
    this.#heldValues = heldValues;
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#realm = realm;

    GuestEngine.Assert(
      this.#valueToNumericKeyMap.getKeyForHeldObject(this.#targetValue) === SearchDriverInternal.#targetValueKey
    );
    GuestEngine.Assert(
      this.#valueToNumericKeyMap.getKeyForHeldObject(this.#heldValues) === SearchDriverInternal.#heldValuesKey
    );

    this.#nodes.push(new ReferenceGraphNodeImpl(targetValue, this.#valueToNumericKeyMap));
    this.#nodes.push(new ReferenceGraphNodeImpl(heldValues, this.#valueToNumericKeyMap));

    Object.freeze(this);
  }

  succeeded = false;

  public run(): ThrowOr<void> {
    void (this.#targetValue);
    void (this.#heldValues);
    void (this.#strongReferencesOnly);

    this.#searchNode(this.#nodes[1]);
  }

  #searchNode(node: ReferenceGraphNode): void {
    const guestValue: GuestEngine.ObjectValue = this.#valueToNumericKeyMap.getHeldObjectForKey(node.objectKey);
    // eslint-disable-next-line no-debugger
    debugger;
    void(this.#realm);
    void(guestValue);
  }
}
