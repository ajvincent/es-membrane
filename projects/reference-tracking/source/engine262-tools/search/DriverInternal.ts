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

/*
import PropertyNameEdgeImpl from "../graphEdges/PropertyNameEdgeImpl.js";
import ArrayIndexEdgeImpl from "../graphEdges/ArrayIndexEdgeImpl.js";
*/

import {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

export default class SearchDriverInternal
implements ReadonlyDeep<ReferenceGraph>
{
  static readonly #targetValueKey = 0;
  static readonly #heldValuesKey = 1;

  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #valueToNumericKeyMap = new ValueToNumericKeyMap;

  readonly #valueToNodeMap = new Map<GuestEngine.ObjectValue, ReferenceGraphNodeImpl>;
  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#realm = realm;

    GuestEngine.Assert(
      this.#valueToNumericKeyMap.getKeyForHeldObject(targetValue) === SearchDriverInternal.#targetValueKey
    );
    GuestEngine.Assert(
      this.#valueToNumericKeyMap.getKeyForHeldObject(heldValues) === SearchDriverInternal.#heldValuesKey
    );

    this.#valueToNodeMap.set(targetValue, new ReferenceGraphNodeImpl(
      targetValue, this.#valueToNumericKeyMap, this.#realm
    ));
    this.#valueToNodeMap.set(heldValues, new ReferenceGraphNodeImpl(
      heldValues, this.#valueToNumericKeyMap, this.#realm
    ));
    Object.freeze(this);
  }

  succeeded = false;

  public run(): ThrowOr<void> {
    void (this.#strongReferencesOnly);

    const nodeIterator: MapIterator<ReferenceGraphNode> = this.#valueToNodeMap.values();
    void(nodeIterator.next());
    for (const node of nodeIterator) {
      this.#searchNode(node);
    }
  }

  public get nodes(): ReferenceGraphNode[] {
    return Array.from(this.#valueToNodeMap.values());
  }

  #searchNode(
    node: ReferenceGraphNode
  ): void
  {
    const guestValue: GuestEngine.ObjectValue = this.#valueToNumericKeyMap.getHeldObjectForKey(node.objectKey);
    // eslint-disable-next-line no-debugger
    debugger;
    void(this.#realm);
    void(guestValue);
  }
}
