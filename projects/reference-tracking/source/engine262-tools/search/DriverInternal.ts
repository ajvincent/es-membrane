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

import ChildToParentImpl from "../graphEdges/ChildToParentImpl.js";

import PropertyNameEdgeImpl from "../graphEdges/PropertyNameEdgeImpl.js";
import ArrayIndexEdgeImpl from "../graphEdges/ArrayIndexEdgeImpl.js";

import {
  ReachableValueSet
} from "../../utilities/ReachableValueSet.js";

import {
  SyncTaskQueue
} from "../../utilities/SyncTaskQueue.js";

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
  readonly #taskQueue = new SyncTaskQueue;
  readonly #reachableValues = new ReachableValueSet(this.#taskQueue);

  readonly #valueToNodeMap = new Map<GuestEngine.ObjectValue, ReferenceGraphNodeImpl>;
  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  foundTargetValue = false;

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

    this.#defineGraphNode(targetValue);
    this.#defineGraphNode(heldValues);

    this.#reachableValues.defineKeyResolver(
      SearchDriverInternal.#targetValueKey, () => this.foundTargetValue = true
    );
    this.#reachableValues.defineKeyResolver(
      SearchDriverInternal.#heldValuesKey, () => undefined
    );

    this.#reachableValues.resolveKey(SearchDriverInternal.#heldValuesKey);
    for (const task of this.#taskQueue.getTasks()) {
      task();
    }

    Object.freeze(this);
  }

  #defineGraphNode(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    this.#valueToNodeMap.set(guestObject, new ReferenceGraphNodeImpl(
      guestObject, this.#valueToNumericKeyMap, this.#realm
    ));
  }

  succeeded = false;

  public run(): ThrowOr<void> {
    const nodeIterator: MapIterator<ReferenceGraphNode> = this.#valueToNodeMap.values();
    void(nodeIterator.next()); // skip past the target value

    for (const node of nodeIterator) {
      this.#searchNode(node);

      for (const task of this.#taskQueue.getTasks()) {
        task();
      }
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

    this.#addObjectProperties(guestValue);
  }

  #addObjectProperties(
    guestValue: GuestEngine.ObjectValue
  ): void
  {
    for (const guestKey of guestValue.OwnPropertyKeys()) {
      const childGuestValue: GuestEngine.Value = GuestEngine.GetV(guestValue, guestKey);
      if (childGuestValue.type !== "Object")
        continue;
      if (this.#valueToNodeMap.has(childGuestValue))
        continue;
      this.#addObjectProperty(guestValue, guestKey, childGuestValue);
    }
  }

  #addObjectProperty(
    guestValue: GuestEngine.ObjectValue,
    guestKey: GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childGuestValue: GuestEngine.ObjectValue
  ): void
  {
    let parentToChildEdge: ParentToChildReferenceGraphEdge;

    if (GuestEngine.isArrayIndex(guestKey)) {
      GuestEngine.Assert(guestKey.type === "String");
      const localIndex = parseInt(guestKey.stringValue());
      parentToChildEdge = new ArrayIndexEdgeImpl(guestValue, localIndex, childGuestValue, this.#valueToNumericKeyMap);
    } else if (guestKey.type === "String") {
      parentToChildEdge = new PropertyNameEdgeImpl(guestValue, guestKey.stringValue(), childGuestValue, this.#valueToNumericKeyMap);
    } else {
      throw new Error("Symbol keys not yet supported");
    }

    this.parentToChildEdges.push(parentToChildEdge);

    const childKey = this.#valueToNumericKeyMap.getKeyForHeldObject(childGuestValue);
    this.#reachableValues.defineKeyResolver(childKey, () => undefined);

    this.#addChildEdge(childGuestValue, [guestValue], true);
  }

  #addChildEdge(
    childGuestValue: GuestEngine.ObjectValue,
    jointOwningValues: readonly GuestEngine.ObjectValue[],
    isStrongOwningReference: boolean,
  ): void
  {
    const childEdge = new ChildToParentImpl(
      childGuestValue,
      jointOwningValues,
      isStrongOwningReference,
      this.#valueToNumericKeyMap
    );
    this.childToParentEdges.push(childEdge);

    this.#reachableValues.keyDependsOnJointOwners(
      childEdge.childObjectKey,
      childEdge.jointOwnerKeys,
      () => this.#defineGraphNode(childGuestValue),
    );

    const childKey = this.#valueToNumericKeyMap.getKeyForHeldObject(childGuestValue);
    if (this.#strongReferencesOnly === false || childEdge.isStrongOwningReference) {
      this.#reachableValues.resolveKey(childKey);
    }
  }
}
