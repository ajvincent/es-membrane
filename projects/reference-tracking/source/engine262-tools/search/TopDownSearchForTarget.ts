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

import {
  ArrayIndexEdgeImpl,
  ChildToParentImpl,
  PropertyNameEdgeImpl,
} from "../graphEdges/graphExports.js";

import {
  ReferenceGraphNodeImpl
} from "./ReferenceGraphNodeImpl.js";

import {
  ChildEdgeReferenceTracker
} from "./ChildEdgeReferenceTracker.js";

import {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

export default class TopDownSearchForTarget
implements ReadonlyDeep<ReferenceGraph>
{
  static readonly #targetValueKey = 0;
  static readonly #heldValuesKey = 1;

  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #valueToNumericKeyMap = new ValueToNumericKeyMap;
  readonly #valueToNodeMap = new Map<GuestEngine.ObjectValue, ReferenceGraphNodeImpl>;

  readonly #childEdgeTracker = new ChildEdgeReferenceTracker(this.#jointEdgeOwnersResolver.bind(this));
  readonly #heldNumericKeys = new Set<number>;

  readonly parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  readonly childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  #parentToChildEdgeIdCounter = 0;

  foundTargetValue = false;
  succeeded = false;

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
      this.#valueToNumericKeyMap.getKeyForHeldObject(targetValue) === TopDownSearchForTarget.#targetValueKey
    );
    GuestEngine.Assert(
      this.#valueToNumericKeyMap.getKeyForHeldObject(heldValues) === TopDownSearchForTarget.#heldValuesKey
    );

    this.#defineGraphNode(targetValue);
    this.#defineGraphNode(heldValues);
    this.#resolveObjectKey(TopDownSearchForTarget.#heldValuesKey);
  }

  #defineGraphNode(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    if (this.#valueToNodeMap.has(guestObject))
      return;

    const node = new ReferenceGraphNodeImpl(
      guestObject, this.#valueToNumericKeyMap, this.#realm
    );
    this.#valueToNodeMap.set(guestObject, node);
    this.#childEdgeTracker.defineKey(node.objectKey);
  }

  #resolveObjectKey(
    objectKey: number
  ): void
  {
    if (objectKey !== TopDownSearchForTarget.#targetValueKey)
      this.#heldNumericKeys.add(objectKey);
  }

  public run(): ThrowOr<void> {
    for (const objectKey of this.#heldNumericKeys) {
      const guestObject = this.#valueToNumericKeyMap.getHeldObjectForKey(objectKey);
      const node = this.#valueToNodeMap.get(guestObject);
      GuestEngine.Assert(node !== undefined);

      this.#searchNode(node);
      this.#childEdgeTracker.resolveKey(objectKey);
    }

    this.succeeded = true;
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
      if (childGuestValue.type === "Object") {
        this.#defineGraphNode(childGuestValue);
        this.#addObjectProperty(guestValue, guestKey, childGuestValue);
      }
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
      parentToChildEdge = new ArrayIndexEdgeImpl(
        guestValue,
        localIndex,
        childGuestValue,
        this.#parentToChildEdgeIdCounter++,
        this.#valueToNumericKeyMap
      );
    } else if (guestKey.type === "String") {
      parentToChildEdge = new PropertyNameEdgeImpl(
        guestValue,
        guestKey.stringValue(),
        childGuestValue,
        this.#parentToChildEdgeIdCounter++,
        this.#valueToNumericKeyMap,
      );
    } else {
      throw new Error("Symbol keys not yet supported");
    }

    this.parentToChildEdges.push(parentToChildEdge);
    this.#addPendingChildEdge(
      childGuestValue,
      [guestValue],
      parentToChildEdge.parentToChildEdgeId,
      true
    );
  }

  #addPendingChildEdge(
    childGuestValue: GuestEngine.ObjectValue,
    jointOwningValues: readonly GuestEngine.ObjectValue[],
    parentToChildEdgeId: number,
    isStrongOwningReference: boolean,
  ): void
  {
    if (this.#strongReferencesOnly && isStrongOwningReference === false) {
      return;
    }

    this.#childEdgeTracker.defineChildEdge(
      this.#valueToNumericKeyMap.getKeyForHeldObject(childGuestValue),
      jointOwningValues.map(owningValue => this.#valueToNumericKeyMap.getKeyForHeldObject(owningValue)),
      isStrongOwningReference,
      parentToChildEdgeId
    );
  }

  #jointEdgeOwnersResolver(
    childKey: number,
    jointOwnerKeys: readonly number[],
    isStrongOwningReference: boolean,
    parentToChildEdgeId: number,
  ): void
  {
    const childGuestValue = this.#valueToNumericKeyMap.getHeldObjectForKey(childKey);
    const jointOwningValues = jointOwnerKeys.map(key => this.#valueToNumericKeyMap.getHeldObjectForKey(key));

    const childEdge = new ChildToParentImpl(
      childGuestValue,
      jointOwningValues,
      isStrongOwningReference,
      parentToChildEdgeId,
      this.#valueToNumericKeyMap
    );
    this.childToParentEdges.push(childEdge);
    this.#resolveObjectKey(childKey);

    if (childKey === 0)
      this.foundTargetValue = true;
  }
}
