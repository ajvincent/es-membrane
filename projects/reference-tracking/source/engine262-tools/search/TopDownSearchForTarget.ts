// #region preamble
import type {
  ReadonlyDeep
} from "type-fest";

import {
  ReferenceGraph,
  ReferenceGraphNode,
  ParentToChildReferenceGraphEdge,
  ChildToParentReferenceGraphEdge,
  CollectionToKeyValueEdge,
} from "../../types/ReferenceGraph.js";

import {
  PRESUMED_HELD_NODE_KEY,
  TARGET_NODE_KEY
} from "../../utilities/constants.js";

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import {
  ArrayIndexEdgeImpl,
  ChildToParentImpl,
  CollectionPseudoEdgeImpl,
  CollectionToKeyValueEdgeImpl,
  InternalSlotEdgeImpl,
  PropertyNameEdgeImpl,
  PropertySymbolEdgeImpl,
  PseudoEdgeToObjectImpl,
} from "../graphEdges/graphExports.js";

import {
  InternalSlotAnalyzerMap
} from "../internalSlotsByType/typeRegistry.js";

import type {
  GuestValueRegistarIfc
} from "../types/GuestValueRegistrar.js";

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
implements ReadonlyDeep<ReferenceGraph>, GuestValueRegistarIfc
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
  public readonly collectionToKeyValueEdges: CollectionToKeyValueEdge[] = [];

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
    void(this.#strongReferencesOnly);
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
  ): void
  {
    this.#childEdgeTracker.defineChildEdge(
      this.#objectValueToNumericKeyMap.getKeyForHeldObject(childGuestValue),
      jointOwningValues.map(owningValue => this.#objectValueToNumericKeyMap.getKeyForHeldObject(owningValue)),
      parentToChildEdgeId
    );
  }

  #jointEdgeOwnersResolver(
    childKey: number,
    jointOwnerKeys: readonly number[],
    parentToChildEdgeId: number,
  ): void
  {
    const childGuestValue = this.#objectValueToNumericKeyMap.getHeldObjectForKey(childKey);
    const jointOwningValues = jointOwnerKeys.map(key => this.#objectValueToNumericKeyMap.getHeldObjectForKey(key));

    const childEdge = new ChildToParentImpl(
      childGuestValue,
      jointOwningValues,
      parentToChildEdgeId,
      this
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
    childObject: GuestEngine.ObjectValue,
    isStrongOwningReference: boolean,
  ): void
  {
    const parentToChildEdge = new InternalSlotEdgeImpl(
      parentObject,
      slotName,
      childObject,
      isStrongOwningReference,
      this
    );

    this.parentToChildEdges.push(parentToChildEdge);
    this.#addPendingChildEdge(
      childObject,
      [ parentObject ],
      parentToChildEdge.parentToChildEdgeId,
    );
  }

  public addCollectionKeyAndValue(
    guestCollection: GuestEngine.ObjectValue,
    guestKey: GuestEngine.Value | undefined,
    keyIsHeldStrongly: boolean,
    guestValue: GuestEngine.Value,
  ): void
  {
    // Map: keyIsHeldStrongly = true, guestKey is defined
    // Set: keyIsHeldStrongly is true, guestKey is undefined
    // WeakMap: keyIsHeldStrongly = false, guestKey is an object
    // WeakSet: keyIsHeldStrongly = false, guestKey is undefined, guestValue is an object
    // ... for the sets, keyIsHeldStrongly really means valueIsHeldStrongly.
    if (keyIsHeldStrongly === false) {
      if (guestKey)
        GuestEngine.Assert(guestKey.type === "Object");
      else {
        GuestEngine.Assert(guestValue.type === "Object");
      }
    }

    if (guestKey?.type === "Object") {
      this.defineGraphNode(guestKey);
    }

    if (guestValue.type === "Object") {
      this.defineGraphNode(guestValue);
    }

    // This pseudo-object we use to tie the collection to a single key-value tuple.
    const CollectionPseudoChild: GuestEngine.ObjectValue = GuestEngine.MakeBasicObject([]);

    // define strong edges between the collection and the pseudo-child to trigger searching keys and values.
    {
      this.defineGraphNode(CollectionPseudoChild);

      const collectionToPseudoEdge = new CollectionPseudoEdgeImpl(
        guestCollection, CollectionPseudoChild, true, this
      );
      this.parentToChildEdges.push(collectionToPseudoEdge);

      this.#addPendingChildEdge(
        CollectionPseudoChild,
        [guestCollection],
        collectionToPseudoEdge.parentToChildEdgeId,
      );

      // this is informative for the top-down search, but will be more useful in the bottom-up search report.
      const keyValueEdge: CollectionToKeyValueEdge = new CollectionToKeyValueEdgeImpl(
        guestCollection, guestKey, guestValue, collectionToPseudoEdge, keyIsHeldStrongly, this
      );
      this.collectionToKeyValueEdges.push(keyValueEdge);
    }

    // Define an edge between the pseudo-child and the key.
    if (guestKey?.type === "Object") {
      const pseudoToKeyEdge = new PseudoEdgeToObjectImpl(
        CollectionPseudoChild,
        guestKey,
        ["collection key"],
        keyIsHeldStrongly,
        this
      );
      this.parentToChildEdges.push(pseudoToKeyEdge);

      this.#addPendingChildEdge(
        guestKey,
        [CollectionPseudoChild],
        pseudoToKeyEdge.parentToChildEdgeId,
      );
    }

    // Define an edge between the pseudo-child and the value, possibly depending on the key as well.
    if (guestValue.type === "Object") {
      const jointOwners: GuestEngine.ObjectValue[] = [CollectionPseudoChild];

      let valueIsHeldStrongly: boolean;
      if (guestKey?.type === "Object") {
        jointOwners.push(guestKey);
        valueIsHeldStrongly = true;
      } else {
        valueIsHeldStrongly = keyIsHeldStrongly;
      }

      const pseudoToValueEdge = new PseudoEdgeToObjectImpl(
        CollectionPseudoChild,
        guestValue,
        ["collection value"],
        valueIsHeldStrongly,
        this
      );
      this.parentToChildEdges.push(pseudoToValueEdge);

      this.#addPendingChildEdge(
        guestValue,
        jointOwners,
        pseudoToValueEdge.parentToChildEdgeId,
      );
    }
  }
  //#endregion TopDownSearchIfc
}
