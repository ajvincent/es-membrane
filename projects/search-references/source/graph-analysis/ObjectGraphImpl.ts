//#region preamble
import graphlib from "@dagrejs/graphlib";

import type {
  Constructor,
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  SearchConfiguration
} from "../public/core-host/types/SearchConfiguration.js";

import type {
  PrefixedNumber,
  SymbolId,
  WeakKeyId,
} from "../types/PrefixedNumber.js";

import type {
  ValueDescription,
} from "../types/ValueDescription.js";

import {
  StringCounter
} from "../utilities/StringCounter.js";

import {
  EdgePrefix,
  NodePrefix,
  ValueDiscrimant
} from "../utilities/constants.js";

import {
  isObjectOrSymbol
} from "../utilities/isObjectOrSymbol.js";

import {
  StrongOwnershipSetsTracker
} from "./StrongOwnershipSetsTracker.js";

import {
  createValueDescription
} from "./createValueDescription.js";

import type {
  CloneableGraphIfc
} from "./types/CloneableGraphIfc.js";

import type {
  EngineWeakKey,
  FinalizationTupleIds,
  GraphEdgeWithMetadata,
  GraphNodeWithMetadata,
  GraphObjectId,
  MapKeyAndValueIds,
  ObjectGraphIfc,
  PrivateFieldTupleIds,
} from "./types/ObjectGraphIfc.js";

import type {
  SearchReferencesIfc,
} from "./types/SearchReferencesIfc.js";
//#endregion preamble

type SetsTracker = StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>;

enum ObjectGraphState {
  AcceptingDefinitions = 0,
  MarkingStrongReferences,
  MarkedStrongReferences,
  Summarizing,
  Summarized,
  Error = Infinity,
}

export type HostObjectGraph<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
> = ObjectGraphIfc<object, symbol, object, ObjectMetadata, RelationshipMetadata>;

export class ObjectGraphImpl<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
>
implements HostObjectGraph<ObjectMetadata, RelationshipMetadata>,
  CloneableGraphIfc, SearchReferencesIfc
{
  static readonly #NOT_APPLICABLE: ValueDescription = Object.freeze({
    valueType: ValueDiscrimant.NotApplicable,
  });

  //#region private class fields
  #state: ObjectGraphState = ObjectGraphState.AcceptingDefinitions;
  #targetId: PrefixedNumber<"target">;
  #heldValuesId: PrefixedNumber<"heldValues">;
  #defineTargetCalled = false;

  #graph = new graphlib.Graph({ directed: true, multigraph: true });

  readonly #nodeCounter = new StringCounter<NodePrefix>;
  readonly #edgeCounter = new StringCounter<EdgePrefix>;

  readonly #weakKeyToIdMap = buildSymbolWeakMap<WeakKey, GraphObjectId>();
  readonly #idToWeakKeyMap = new Map<GraphObjectId, WeakKey>;
  readonly #edgeIdToMetadataMap = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>>
  >;

  readonly #ownershipSetsTracker = new StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>(
    this.#ownershipResolver.bind(this)
  );
  readonly #edgeIdTo_IsStrongReference_Map = new Map<PrefixedNumber<EdgePrefix>, boolean>;
  readonly #weakKeyHeldStronglyMap = buildSymbolWeakMap<WeakKey, boolean>();
  readonly #weakKeyIdsToVisit = new Set<PrefixedNumber<NodePrefix>>;

  readonly #edgeIdToJointOwnersMap_Weak = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlySet<PrefixedNumber<NodePrefix>>
  >;
  readonly #edgeIdToJointOwnersMap_Strong = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlySet<PrefixedNumber<NodePrefix>>
  >;

  #searchedForStrongReferences = false;
  #strongReferenceCallback?: (key: WeakKey) => void;

  #searchConfiguration?: SearchConfiguration
  //#endregion private class fields

  constructor(
    searchConfiguration?: SearchConfiguration
  )
  {
    this.#targetId = "target:-1";
    this.#heldValuesId = "heldValues:-2";
    this.#searchConfiguration = searchConfiguration;

    this.#graph.setGraph({});
  }

  #throwInternalError(error: Error): never {
    if (this.#searchConfiguration?.internalErrorTrap) {
      this.#searchConfiguration.internalErrorTrap();
    }
    throw error;
  }

  public defineTargetAndHeldValues(
    target: WeakKey,
    targetMetadata: ObjectMetadata,
    heldValues: object,
    heldValuesMetadata: ObjectMetadata,
  )
  {
    this.#defineTargetCalled = true;
    this.#targetId = this.#defineWeakKey(target, targetMetadata, NodePrefix.Target);
    this.#heldValuesId = this.#defineWeakKey(heldValues, heldValuesMetadata, NodePrefix.HeldValues);

    this.#weakKeyHeldStronglyMap.delete(target);
  }

  #assertDefineTargetCalled(): void {
    if (!this.#defineTargetCalled) {
      this.#throwInternalError(new Error("you must call defineTargetAndHeldValues first!"));
    }
  }

  #setNextState(nextState: ObjectGraphState): void {
    this.#assertDefineTargetCalled();
    if (nextState >= this.#state) {
      this.#state = nextState;
    } else {
      this.#state = ObjectGraphState.Error;
      this.#throwInternalError(new Error("invalid state transition"));
    }
  }

  //#region CloneableGraphIfc
  public cloneGraph(): graphlib.Graph {
    this.#assertDefineTargetCalled();
    return graphlib.json.read(graphlib.json.write(this.#graph));
  }
  //#endregion CloneableGraphIfc

  //#region ValueIdIfc
  public getWeakKeyId(
    weakKey: EngineWeakKey<object, symbol>
  ): WeakKeyId
  {
    this.#assertDefineTargetCalled();
    const id: GraphObjectId =  this.#requireWeakKeyId(weakKey, "weakKey");
    if (id.startsWith("keyValueTuple") || id.startsWith("finalizationTuple"))
      this.#throwInternalError(new Error("object is a internal tuple, how did you get it?"));
    return id as WeakKeyId;
  }
  //#endregion ValueIdIfc

  //#region ObjectGraphIfc
  public hasObject(object: object): boolean {
    this.#assertDefineTargetCalled();
    return this.#weakKeyToIdMap.has(object);
  }

  public hasSymbol(symbol: symbol): boolean {
    this.#assertDefineTargetCalled();
    return this.#weakKeyToIdMap.has(symbol);
  }

  public hasPrivateName(object: object): boolean {
    this.#assertDefineTargetCalled();
    return this.#weakKeyToIdMap.has(object);
  }

  public defineObject(
    object: object,
    metadata: ObjectMetadata
  ): void
  {
    this.#defineWeakKey(object, metadata, NodePrefix.Object);
  }

  public defineSymbol(symbol: symbol, metadata: ObjectMetadata): void {
    this.#defineWeakKey(symbol, metadata, NodePrefix.Symbol);
  }

  public definePrivateName(
    privateName: object,
    description: `#${string}`,
  ): void
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    if (this.#weakKeyToIdMap.has(privateName)) {
      this.#throwInternalError(new Error(
        "privateName is already defined as a node in this graph, with id " + this.#weakKeyToIdMap.get(privateName)!
      ));
    }

    const nodeId = this.#nodeCounter.next(NodePrefix.PrivateName);
    this.#weakKeyToIdMap.set(privateName, nodeId);
    this.#idToWeakKeyMap.set(nodeId, privateName);

    const nodeMetadata: GraphNodeWithMetadata<Record<"description", string>> = {
      width: 200,
      height: 200,
      metadata: {
        description
      }
    };
    this.#graph.setNode(nodeId, nodeMetadata);

    this.#ownershipSetsTracker.defineKey(nodeId);
    this.#weakKeyHeldStronglyMap.set(privateName, false);
  }

  #defineWeakKey<Prefix extends NodePrefix>(
    weakKey: object | symbol,
    metadata: ObjectMetadata | null,
    prefix: Prefix,
  ): PrefixedNumber<Prefix>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    if (this.#weakKeyToIdMap.has(weakKey)) {
      this.#throwInternalError(new Error(
        "object is already defined as a node in this graph, with id " + this.#weakKeyToIdMap.get(weakKey)!
      ));
    }

    const nodeId = this.#nodeCounter.next(prefix);
    this.#weakKeyToIdMap.set(weakKey, nodeId);
    this.#idToWeakKeyMap.set(nodeId, weakKey);

    const nodeMetadata: GraphNodeWithMetadata<ObjectMetadata | null> = {
      width: 200,
      height: 200,
      metadata,
    };
    this.#graph.setNode(nodeId, nodeMetadata);

    this.#ownershipSetsTracker.defineKey(nodeId);
    this.#weakKeyHeldStronglyMap.set(weakKey, false);

    if (this.#searchConfiguration?.defineWeakKeyTrap) {
      this.#searchConfiguration.defineWeakKeyTrap(nodeId);
    }
    return nodeId;
  }

  #requireWeakKeyId(
    weakKey: WeakKey,
    identifier: string
  ): GraphObjectId
  {
    const id = this.#weakKeyToIdMap.get(weakKey);
    if (!id)
      this.#throwInternalError(new Error(identifier + " is not defined as a node"));
    return id;
  }

  #defineEdge<EP extends EdgePrefix>(
    label: string,
    parentId: GraphObjectId,
    edgePrefixType: EP,
    description: ValueDescription,
    metadata: RelationshipMetadata | null,
    childId: GraphObjectId,
    isStrongReference: boolean,
    secondParentId: GraphObjectId | undefined,
  ): PrefixedNumber<EP>
  {
    const edgeId = this.#edgeCounter.next(edgePrefixType);
    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata | null> = {
      label,
      edgeType: edgePrefixType,
      description,
      metadata,
      isStrongReference,
    };

    const jointOwnerKeys = [parentId];
    if (secondParentId)
      jointOwnerKeys.push(secondParentId);

    this.#graph.setEdge(parentId, childId, edgeMetadata, edgeId);
    this.#edgeIdToMetadataMap.set(
      edgeId,
      edgeMetadata as ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>>
    );

    if (childId === this.#targetId)
      this.#weakKeyHeldStronglyMap.set(this.#idToWeakKeyMap.get(this.#targetId)!, false);

    const keySet = new Set(jointOwnerKeys);
    this.#edgeIdToJointOwnersMap_Weak.set(edgeId, keySet);

    this.#ownershipSetsTracker.defineChildEdge(
      childId, jointOwnerKeys, edgeId
    );
    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReference);

    if (this.#searchConfiguration?.defineEdgeTrap) {
      this.#searchConfiguration.defineEdgeTrap(
        parentId, edgeId, childId, secondParentId, isStrongReference
      );
    }

    return edgeId;
  }

  public defineAsSymbolKey(
    parentObject: object,
    relationshipName: symbol,
    keyEdgeMetadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.HasSymbolAsKey>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
    const relationshipId = this.#requireWeakKeyId(relationshipName, "childObject") as SymbolId;

    const edgeId = this.#defineEdge(
      relationshipName.description ?? "(symbol)",
      parentId, EdgePrefix.HasSymbolAsKey, ObjectGraphImpl.#NOT_APPLICABLE,
      keyEdgeMetadata, relationshipId, true, undefined
    );
    return edgeId;
  }

  #hasSymbolKeyEdge(
    edge: graphlib.Edge
  ): boolean
  {
    return (
      this.#graph.edgeAsObj(edge) as GraphEdgeWithMetadata<RelationshipMetadata | null>
    ).edgeType === EdgePrefix.HasSymbolAsKey;
  }

  public definePropertyOrGetter(
    parentObject: object,
    relationshipName: number | string | symbol,
    childObject: object,
    metadata: RelationshipMetadata,
    isGetter: boolean,
  ): PrefixedNumber<EdgePrefix.GetterKey | EdgePrefix.PropertyKey>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
    const childId = this.#requireWeakKeyId(childObject, "childObject");

    if (typeof relationshipName === "symbol") {
      const symbolId = this.getWeakKeyId(relationshipName);
      const matchingEdges: graphlib.Edge[] = this.#graph.outEdges(parentId, symbolId) ?? [];
      if (matchingEdges.some(edge => this.#hasSymbolKeyEdge(edge)) === false) {
        this.#throwInternalError(new Error(
          `no edge found between parent object "${parentId}" and symbol key "${symbolId}"`
        ));
      }
    }

    const label = typeof relationshipName === "symbol" ? (
      relationshipName.description ?? "(symbol)"
    ) : relationshipName.toString();
    const edgeId = this.#defineEdge(
      label, parentId,
      isGetter ? EdgePrefix.GetterKey : EdgePrefix.PropertyKey,
      createValueDescription(relationshipName, this),
      metadata, childId, true, undefined
    );

    return edgeId;
  }

  public defineConstructorOf(
    instanceObject: object,
    ctorObject: Constructor<object, unknown[]>,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.InstanceOf>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    if (typeof ctorObject !== "function") {
      this.#throwInternalError(new Error("ctorObject must be a function!"));
    }

    const instanceId = this.#requireWeakKeyId(instanceObject, "instanceObject");
    const ctorId = this.#requireWeakKeyId(ctorObject, "ctorObject");

    const edgeId = this.#defineEdge(
      "(constructor)",
      instanceId, EdgePrefix.InstanceOf, ObjectGraphImpl.#NOT_APPLICABLE,
      metadata, ctorId, true, undefined
    );
    return edgeId;
  }

  public defineScopeValue(
    functionObject: object,
    identifier: string,
    objectValue: EngineWeakKey<object, symbol>,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.ScopeValue>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    if (typeof functionObject !== "function") {
      this.#throwInternalError(new Error("functionObject must be a function!"));
    }

    const functionId = this.#requireWeakKeyId(functionObject, "functionObject");
    const valueId = this.#requireWeakKeyId(objectValue, "objectValue");

    return this.#defineEdge(
      "(scope:" + identifier + ")",
      functionId, EdgePrefix.ScopeValue, createValueDescription(identifier, this),
      metadata, valueId, true, undefined
    );
  }

  public defineInternalSlot(
    parentObject: object,
    slotName: `[[${string}]]`,
    childObject: object,
    isStrongReference: boolean,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.InternalSlot>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
    const childId = this.#requireWeakKeyId(childObject, "childObject");

    const edgeId = this.#defineEdge(
      slotName,
      parentId, EdgePrefix.InternalSlot, createValueDescription(slotName, this),
      metadata, childId, isStrongReference, undefined
    );
    return edgeId;
  }

  public defineMapKeyValueTuple(
    map: object,
    key: unknown,
    value: unknown,
    isStrongReferenceToKey: boolean,
    keyMetadata: RelationshipMetadata | undefined,
    valueMetadata: RelationshipMetadata | undefined,
  ): MapKeyAndValueIds
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const mapId = this.#requireWeakKeyId(map, "map");

    let keyId: GraphObjectId | undefined;
    let valueId: GraphObjectId | undefined;

    if (isObjectOrSymbol(key) === false && isStrongReferenceToKey === false) {
      this.#throwInternalError(new Error("key must be a WeakKey"));
    }

    if (isObjectOrSymbol(key)) {
      keyId = this.#requireWeakKeyId(key, "key");
    }

    if (isObjectOrSymbol(value)) {
      valueId = this.#requireWeakKeyId(value, "value");
    }

    if (!keyId && !valueId)
      this.#throwInternalError(new Error("Why are you calling me when neither the key nor the value is an object?"));
    if (keyId && keyMetadata === undefined) {
      this.#throwInternalError(new Error("Need metadata for key"));
    }
    if (valueId && valueMetadata === undefined) {
      this.#throwInternalError(new Error("Need metadata for value"));
    }

    const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.KeyValueTuple);
    if (this.#searchConfiguration?.defineNodeTrap) {
      this.#searchConfiguration.defineNodeTrap(mapId, tupleNodeId, "(new map tuple)");
    }

    // map-to-key edge
    let mapToKeyEdgeId: PrefixedNumber<EdgePrefix.MapKey> | undefined;
    if (keyId) {
      const keyDescription: ValueDescription = createValueDescription(key, this);
      mapToKeyEdgeId = this.#defineEdge(
        "(map key)",
        mapId, EdgePrefix.MapKey, keyDescription, keyMetadata ?? null, keyId,
        isStrongReferenceToKey, undefined
      );
    }

    // map to tuple
    const mapToTupleEdgeId = this.#defineEdge(
      "(map tuple)",
      mapId, EdgePrefix.MapToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, keyId
    );

    // key to tuple
    let keyToTupleEdgeId: PrefixedNumber<EdgePrefix.MapKeyToTuple> | undefined;
    if (keyId) {
      keyToTupleEdgeId = this.#defineEdge(
        "(map key to tuple)",
        keyId, EdgePrefix.MapKeyToTuple, ObjectGraphImpl.#NOT_APPLICABLE, null, tupleNodeId,
        true, mapId
      );
    }

    // map value edge
    let tupleToValueEdgeId: PrefixedNumber<EdgePrefix.MapValue> | undefined;
    if (valueId) {
      tupleToValueEdgeId = this.#defineEdge(
        "(map value)",
        tupleNodeId, EdgePrefix.MapValue, createValueDescription(value, this),
        valueMetadata === undefined ? null : valueMetadata,
        valueId, true, keyId
      );
    }

    return {
      tupleNodeId,
      mapToKeyEdgeId,
      mapToTupleEdgeId,
      keyToTupleEdgeId,
      tupleToValueEdgeId
    };
  }

  public defineSetValue(
    set: object,
    value: WeakKey,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.SetValue>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const setId = this.#requireWeakKeyId(set, "set");
    const valueId = this.#requireWeakKeyId(value, "value");

    const edgeId = this.#defineEdge(
      "(element)",
      setId, EdgePrefix.SetValue, ObjectGraphImpl.#NOT_APPLICABLE,
      metadata, valueId, isStrongReferenceToValue, undefined
    );
    return edgeId;
  }

  public defineFinalizationTuple(
    registry: object,
    target: WeakKey,
    heldValue: unknown,
    unregisterToken: WeakKey | undefined,
  ): FinalizationTupleIds
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const registryId = this.#requireWeakKeyId(registry, "registry");
    const targetId = this.#requireWeakKeyId(target, "target");

    let heldValueId: GraphObjectId | undefined;
    if (isObjectOrSymbol(heldValue)) {
      heldValueId = this.#requireWeakKeyId(heldValue, "heldValue");
    }

    let unregisterTokenId: GraphObjectId | undefined;
    if (typeof unregisterToken !== "undefined" && unregisterToken !== target) {
      unregisterTokenId = this.#requireWeakKeyId(unregisterToken, "unregisterToken");
    }
    const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.FinalizationTuple);
    if (this.#searchConfiguration?.defineNodeTrap) {
      this.#searchConfiguration.defineNodeTrap(registryId, tupleNodeId, "(new finalization tuple)");
    }

    const registryToTargetEdgeId = this.#defineEdge(
      "(registry to target)",
      registryId, EdgePrefix.FinalizationRegistryToTarget, createValueDescription(target, this),
      null, targetId, false, undefined
    );

    const registryToTupleEdgeId = this.#defineEdge(
      "(registry to tuple)",
      registryId, EdgePrefix.FinalizationRegistryToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, targetId
    );

    const registryTargetToTupleEdgeId = this.#defineEdge(
      "(registry target to tuple)",
      targetId, EdgePrefix.FinalizationTargetToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, registryId
    );

    let tupleToHeldValueEdgeId: PrefixedNumber<EdgePrefix.FinalizationTupleToHeldValue> | undefined;
    if (heldValueId) {
      tupleToHeldValueEdgeId = this.#defineEdge(
        "(held value)",
        tupleNodeId, EdgePrefix.FinalizationTupleToHeldValue,
        createValueDescription(heldValue, this),
        null, heldValueId, true, targetId
      );
    }

    let tupleToUnregisterTokenEdgeId: PrefixedNumber<EdgePrefix.FinalizationTupleToUnregisterToken> | undefined;
    if (unregisterTokenId) {
      tupleToUnregisterTokenEdgeId = this.#defineEdge(
        "(unregister token)",
        tupleNodeId, EdgePrefix.FinalizationTupleToUnregisterToken,
        createValueDescription(unregisterToken, this),
        null, unregisterTokenId, false, targetId
      );
    }

    return {
      tupleNodeId,
      registryToTargetEdgeId,
      registryToTupleEdgeId,
      registryTargetToTupleEdgeId,
      tupleToHeldValueEdgeId,
      tupleToUnregisterTokenEdgeId,
    };
  }

  definePrivateField(
    parentObject: object,
    privateName: object,
    privateKey: `#${string}`,
    childObject: EngineWeakKey<object, symbol>,
    privateNameMetadata: RelationshipMetadata,
    childMetadata: RelationshipMetadata,
    isGetter: boolean
  ): PrivateFieldTupleIds
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const parentId = this.#requireWeakKeyId(parentObject, "parentObject");
    const privateNameId = this.#requireWeakKeyId(privateName, "privateName");
    if (privateNameId.startsWith(NodePrefix.PrivateName) === false)
      throw new Error("privateName is not a registered private name!");
    const childId = this.#requireWeakKeyId(childObject, "childObject");

    const tupleNodeId = this.#defineWeakKey({}, null, NodePrefix.PrivateFieldTuple);
    if (this.#searchConfiguration?.defineNodeTrap) {
      this.#searchConfiguration.defineNodeTrap(parentId, tupleNodeId, "(new private field tuple)");
    }

    const objectToPrivateKeyEdgeId = this.#defineEdge(
      "(private key)",
      parentId, EdgePrefix.ObjectToPrivateKey, ObjectGraphImpl.#NOT_APPLICABLE,
      privateNameMetadata, privateNameId, true, undefined
    );

    const objectToTupleEdgeId = this.#defineEdge(
      "(object to private tuple)",
      parentId, EdgePrefix.ObjectToPrivateTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, privateNameId
    );

    const privateKeyToTupleEdgeId = this.#defineEdge(
      "(private key to tuple)",
      privateNameId, EdgePrefix.PrivateKeyToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, parentId
    );

    const tupleToValueEdgeId = this.#defineEdge(
      privateKey, tupleNodeId,
      isGetter ? EdgePrefix.PrivateTupleToGetter : EdgePrefix.PrivateTupleToValue,
      createValueDescription(privateKey, this),
      childMetadata, childId, true, parentId
    );

    return {
      tupleNodeId,
      objectToPrivateKeyEdgeId,
      objectToTupleEdgeId,
      privateKeyToTupleEdgeId,
      tupleToValueEdgeId
    };
  }

  public getEdgeRelationship(
    edgeId: PrefixedNumber<EdgePrefix>
  ): ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>> | undefined
  {
    this.#assertDefineTargetCalled();
    return this.#edgeIdToMetadataMap.get(edgeId);
  }
  //#endregion ObjectGraphIfc

  //#region SearchReferencesIfc
  setStrongReferenceCallback(callback: (key: WeakKey) => void) {
    this.#setNextState(ObjectGraphState.MarkingStrongReferences);
    this.#strongReferenceCallback = callback;
  }

  #ownershipResolver(
    childKey: GraphObjectId,
    jointOwnerKeys: readonly GraphObjectId[],
    edgeId: PrefixedNumber<EdgePrefix>,
    tracker: SetsTracker
  ): void
  {
    const isStrongReference: boolean = this.#edgeIdTo_IsStrongReference_Map.get(edgeId)!;
    if (isStrongReference) {
      this.#weakKeyIdsToVisit.add(childKey);

      const objectOrSymbol: object | symbol = this.#idToWeakKeyMap.get(childKey)!;
      this.#weakKeyHeldStronglyMap.set(objectOrSymbol, true);

      if (this.#strongReferenceCallback && /Tuple:/.test(childKey) === false) {
        this.#strongReferenceCallback(objectOrSymbol);
      }

      const keySet = new Set(jointOwnerKeys);
      this.#edgeIdToJointOwnersMap_Strong.set(edgeId, keySet);
    }

    void(tracker);
  }

  public markStrongReferencesFromHeldValues(): void {
    this.#setNextState(ObjectGraphState.MarkingStrongReferences);
    this.#searchedForStrongReferences = true;

    const heldValues = this.#idToWeakKeyMap.get(this.#heldValuesId) as object;
    this.#weakKeyHeldStronglyMap.set(heldValues, true);

    this.#weakKeyIdsToVisit.add(this.#heldValuesId);
    try {
      for (const id of this.#weakKeyIdsToVisit) {
        if (this.#searchConfiguration?.markStrongNodeTrap)
          this.#searchConfiguration?.markStrongNodeTrap(id);
        this.#ownershipSetsTracker.resolveKey(id);
      }

      this.#state = ObjectGraphState.MarkedStrongReferences;
    } catch (ex) {
      this.#state = ObjectGraphState.Error;
      throw ex;
    }
  }

  public isKeyHeldStrongly(object: object): boolean {
    this.#assertDefineTargetCalled();
    if (!this.#searchedForStrongReferences) {
      this.#throwInternalError(new Error("You haven't searched for strong references yet."));
    }
    this.#setNextState(ObjectGraphState.MarkedStrongReferences);
    return this.#weakKeyHeldStronglyMap.get(object) ?? false;
  }

  public summarizeGraphToTarget(
    strongReferencesOnly: boolean,
  ): void
  {
    this.#setNextState(ObjectGraphState.Summarizing);
    try {

      const target = this.#idToWeakKeyMap.get(this.#targetId) as object;
      const targetReference: boolean | undefined = this.#weakKeyHeldStronglyMap.get(target);

      let edgeIdToJointOwnersMap: ReadonlyMap<
        PrefixedNumber<EdgePrefix>,
        ReadonlySet<PrefixedNumber<NodePrefix>>
      > | undefined;

      if (strongReferencesOnly && targetReference === true) {
        edgeIdToJointOwnersMap = this.#edgeIdToJointOwnersMap_Strong;
      } else if (!strongReferencesOnly && targetReference !== undefined) {
        edgeIdToJointOwnersMap = this.#edgeIdToJointOwnersMap_Weak;
      }
      if (edgeIdToJointOwnersMap) {
        this.#summarizeGraphToTarget(edgeIdToJointOwnersMap);
        this.#summarizeGraphFromHeldValues();
      } else {
        this.#graph = new graphlib.Graph({ directed: true, multigraph: true });
      }

      this.#setNextState(ObjectGraphState.Summarized);
    } catch (ex) {
      this.#state = ObjectGraphState.Error;
      throw ex;
    }
  }

  #summarizeGraphToTarget(
    edgeIdToJointOwnersMap: ReadonlyMap<
      PrefixedNumber<EdgePrefix>,
      ReadonlySet<PrefixedNumber<NodePrefix>>
    >,
  ): void
  {
    const summaryGraph = new graphlib.Graph({ directed: true, multigraph: true });
    const wNodeIds = new Set<GraphObjectId>([this.#targetId]);

    for (const id of wNodeIds) {
      const edges = this.#graph.inEdges(id);
      if (!edges)
        continue;

      const wNode = this.#graph.node(id);
      if (!summaryGraph.node(id)) {
        summaryGraph.setNode(id, wNode);
      }

      for (const e of edges) {
        const vNodeId = e.v;
        if (!summaryGraph.node(vNodeId)) {
          summaryGraph.setNode(vNodeId, this.#graph.node(vNodeId));
        }

        const edgeId = e.name as PrefixedNumber<EdgePrefix>;
        summaryGraph.setEdge(e, this.#graph.edge(e));

        const jointOwnerKeys: ReadonlySet<PrefixedNumber<NodePrefix>> | undefined = edgeIdToJointOwnersMap.get(edgeId);
        if (!jointOwnerKeys)
          continue;
        for (const ownerKey of jointOwnerKeys) {
          wNodeIds.add(ownerKey);
        }
      }
    }

    this.#graph = summaryGraph;
  }

  #summarizeGraphFromHeldValues(): void
  {
    const summaryGraph = new graphlib.Graph({ directed: true, multigraph: true });
    const vNodeIds = new Set<GraphObjectId>([this.#heldValuesId]);

    summaryGraph.setNode(this.#heldValuesId, this.#graph.node(this.#heldValuesId));

    for (const id of vNodeIds) {
      const edges = this.#graph.outEdges(id);
      if (!edges)
        continue;

      for (const e of edges) {
        const wNodeId = e.w;
        if (!summaryGraph.node(wNodeId)) {
          summaryGraph.setNode(wNodeId, this.#graph.node(wNodeId));
          vNodeIds.add(wNodeId as GraphObjectId);
        }
        summaryGraph.setEdge(e, this.#graph.edge(e));
      }
    }

    this.#graph = summaryGraph;
  }
  //#endregion SearchReferencesIfc
}

let supportsWeakSymbolKeys: boolean | undefined;
function buildSymbolWeakMap<Key extends WeakKey, Value>(): WeakMap<Key, Value> {
  if (supportsWeakSymbolKeys === undefined) {
    supportsWeakSymbolKeys = false;
    try {
      void new WeakMap([
        [Symbol(), "success"]
      ]);
      supportsWeakSymbolKeys = true;
    }
    catch (ex) {
      void(ex);
    }
  }

  return supportsWeakSymbolKeys ? new WeakMap : new Map;
}