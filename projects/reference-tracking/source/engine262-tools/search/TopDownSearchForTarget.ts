// #region preamble
import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
  PRESUMED_HELD_NODE_KEY,
  TARGET_NODE_KEY,
} from "../../ReferenceGraph.js";

import {
  ArrayIndexEdgeImpl,
  ChildToParentImpl,
  InternalSlotEdgeImpl,
  PropertyNameEdgeImpl,
  PropertySymbolEdgeImpl,
} from "../graphEdges/graphExports.js";

import {
  InternalSlotAnalyzerMap
} from "../internalSlotsByType/typeRegistry.js";

import type {
  TopDownSearchIfc
} from "../types/TopDownSearchIfc.js";

import {
  ReferenceGraphNodeImpl
} from "./ReferenceGraphNodeImpl.js";

import {
  ChildEdgeReferenceTracker
} from "./ChildEdgeReferenceTracker.js";

import {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

import {
  findInternalSlotsType
} from "./findInternalSlotsType.js";

//#endregion preamble

export class TopDownSearchForTarget
implements ReadonlyDeep<ReferenceGraph>, TopDownSearchIfc
{
  static * #counter(): Iterator<number> {
    let count = 0;
    while (count > -1) {
      yield count;
      count++;
    }
  }

  readonly #strongReferencesOnly: boolean;
  readonly #realm: GuestEngine.ManagedRealm;

  readonly #sharedIdCounter: Iterator<number> = TopDownSearchForTarget.#counter();

  readonly #objectValueToNumericKeyMap = new ValueToNumericKeyMap<GuestEngine.ObjectValue>(this.#sharedIdCounter);
  readonly #symbolValueToNumericKeyMap = new ValueToNumericKeyMap<GuestEngine.SymbolValue>(this.#sharedIdCounter);
  readonly #valueToNodeMap = new Map<GuestEngine.ObjectValue, ReferenceGraphNodeImpl>;

  readonly #childEdgeTracker = new ChildEdgeReferenceTracker(this.#jointEdgeOwnersResolver.bind(this));
  readonly #heldNumericKeys = new Set<number>;
  readonly #objectKeysToExcludeFromSearch = new Set<number>;

  public readonly parentToChildEdges: ParentToChildReferenceGraphEdge[] = [];
  public readonly childToParentEdges: ChildToParentReferenceGraphEdge[] = [];

  #parentToChildEdgeIdCounter = 0;

  public foundTargetValue = false;
  public succeeded = false;

  public constructor(
    targetValue: GuestEngine.ObjectValue,
    heldValues: GuestEngine.ObjectValue,
    strongReferencesOnly: boolean,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;
    this.#realm = realm;

    GuestEngine.Assert(
      this.#objectValueToNumericKeyMap.getKeyForHeldObject(targetValue) === TARGET_NODE_KEY
    );
    GuestEngine.Assert(
      this.#objectValueToNumericKeyMap.getKeyForHeldObject(heldValues) === PRESUMED_HELD_NODE_KEY
    );

    this.defineGraphNode(targetValue);
    this.defineGraphNode(heldValues);

    this.excludeObjectFromSearch(targetValue);
    this.#resolveObjectKey(PRESUMED_HELD_NODE_KEY);
  }

  #resolveObjectKey(
    objectKey: number
  ): void
  {
    if (this.#objectKeysToExcludeFromSearch.has(objectKey) === false)
      this.#heldNumericKeys.add(objectKey);
  }

  public run(): ThrowOr<void> {
    for (const objectKey of this.#heldNumericKeys) {
      const guestObject = this.#objectValueToNumericKeyMap.getHeldObjectForKey(objectKey);
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
    const guestValue: GuestEngine.ObjectValue = this.#objectValueToNumericKeyMap.getHeldObjectForKey(node.objectKey);
    if (GuestEngine.isProxyExoticObject(guestValue) === false) {
      this.#addObjectProperties(guestValue);
    }

    this.#lookupAndAddInternalSlots(guestValue);
  }

  #addObjectProperties(
    guestValue: GuestEngine.ObjectValue
  ): void
  {
    for (const guestKey of guestValue.OwnPropertyKeys()) {
      const childGuestValue: GuestEngine.Value = GuestEngine.GetV(guestValue, guestKey);
      if (childGuestValue.type === "Object") {
        this.defineGraphNode(childGuestValue);
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
        this
      );
    }
    else if (guestKey.type === "String") {
      parentToChildEdge = new PropertyNameEdgeImpl(
        guestValue,
        guestKey.stringValue(),
        childGuestValue,
        this
      );
    }
    else {
      this.#symbolValueToNumericKeyMap.getKeyForHeldObject(guestKey);
      parentToChildEdge = new PropertySymbolEdgeImpl(
        guestValue,
        guestKey,
        childGuestValue,
        this
      );
    }

    this.parentToChildEdges.push(parentToChildEdge);
    this.#addPendingChildEdge(
      childGuestValue,
      [guestValue],
      parentToChildEdge.parentToChildEdgeId,
      true
    );
  }

  #lookupAndAddInternalSlots(
    guestValue: GuestEngine.ObjectValue
  ): void
  {
    const internalSlotType = findInternalSlotsType(guestValue);
    if (internalSlotType) {
      const slotAnalyzer = InternalSlotAnalyzerMap.get(internalSlotType);
      GuestEngine.Assert(slotAnalyzer !== undefined);
      slotAnalyzer.addEdgesForObject(this, guestValue)
    }
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
      this.#objectValueToNumericKeyMap.getKeyForHeldObject(childGuestValue),
      jointOwningValues.map(owningValue => this.#objectValueToNumericKeyMap.getKeyForHeldObject(owningValue)),
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
    const childGuestValue = this.#objectValueToNumericKeyMap.getHeldObjectForKey(childKey);
    const jointOwningValues = jointOwnerKeys.map(key => this.#objectValueToNumericKeyMap.getHeldObjectForKey(key));

    const childEdge = new ChildToParentImpl(
      childGuestValue,
      jointOwningValues,
      isStrongOwningReference,
      parentToChildEdgeId,
      this.#objectValueToNumericKeyMap
    );
    this.childToParentEdges.push(childEdge);
    this.#resolveObjectKey(childKey);

    if (childKey === 0)
      this.foundTargetValue = true;
  }

  //#region TopDownSearchIfc
  public defineGraphNode(
    guestObject: GuestEngine.ObjectValue
  ): void
  {
    if (this.#valueToNodeMap.has(guestObject))
      return;

    const node = new ReferenceGraphNodeImpl(
      guestObject, this.#objectValueToNumericKeyMap, this.#realm
    );
    this.#valueToNodeMap.set(guestObject, node);
    this.#childEdgeTracker.defineKey(node.objectKey);
  }

  public excludeObjectFromSearch(guestObject: GuestEngine.ObjectValue) {
    const numericKey = this.#objectValueToNumericKeyMap.getKeyForHeldObject(guestObject);
    this.#objectKeysToExcludeFromSearch.add(numericKey);
  }

  public getNextParentToChildEdgeId(): number {
      return this.#parentToChildEdgeIdCounter++;
  }

  public getKeyForExistingHeldObject(objectValue: GuestEngine.ObjectValue): number {
    GuestEngine.Assert(this.#objectValueToNumericKeyMap.hasHeldObject(objectValue));
    return this.#objectValueToNumericKeyMap.getKeyForHeldObject(objectValue);
  }

  public getKeyForExistingHeldSymbol(symbolValue: GuestEngine.SymbolValue): number {
    GuestEngine.Assert(this.#symbolValueToNumericKeyMap.hasHeldObject(symbolValue));
    return this.#symbolValueToNumericKeyMap.getKeyForHeldObject(symbolValue);
  }

  public addInternalSlotEdge(
    parentObject: GuestEngine.ObjectValue,
    slotName: `[[${string}]]`,
    childObject: GuestEngine.ObjectValue
  ): void
  {
    const parentToChildEdge = new InternalSlotEdgeImpl(
      parentObject,
      slotName,
      childObject,
      this
    );

    this.parentToChildEdges.push(parentToChildEdge);
    this.#addPendingChildEdge(
      childObject,
      [ parentObject ],
      parentToChildEdge.parentToChildEdgeId,
      true,
    );
  }
  //#endregion TopDownSearchIfc
}
