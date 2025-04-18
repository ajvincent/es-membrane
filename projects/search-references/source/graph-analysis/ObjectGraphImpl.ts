//#region preamble
import graphlib from "@dagrejs/graphlib";

import type {
  Constructor,
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  SearchConfiguration
} from "../public/host/types/SearchConfiguration.js";

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

  readonly #weakKeyToIdMap = new WeakMap<WeakKey, GraphObjectId>;
  readonly #idToWeakKeyMap = new Map<GraphObjectId, WeakKey>;
  readonly #edgeIdToMetadataMap = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>>
  >;

  readonly #ownershipSetsTracker = new StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>(
    this.#ownershipResolver.bind(this)
  );
  readonly #edgeIdTo_IsStrongReference_Map = new Map<PrefixedNumber<EdgePrefix>, boolean>;
  readonly #weakKeyHeldStronglyMap = new WeakMap<WeakKey, boolean>;
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

    const nodeMetadata: GraphNodeWithMetadata<ObjectMetadata | null> = { metadata };
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
      edgeType: edgePrefixType,
      description,
      metadata,
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

    const edgeId = this.#defineEdge(
      parentId,
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

    // map to tuple
    const mapToTupleEdgeId = this.#defineEdge(
      mapId, EdgePrefix.MapToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, undefined
    );

    const keyDescription: ValueDescription = createValueDescription(key, this);

    // map key edge
    let tupleToKeyEdgeId: PrefixedNumber<EdgePrefix.MapKey> | undefined;
    if (keyId) {
      tupleToKeyEdgeId = this.#defineEdge(
        tupleNodeId, EdgePrefix.MapKey, keyDescription,
        keyMetadata === undefined ? null : keyMetadata,
        keyId, isStrongReferenceToKey, undefined
      );
    }

    // map value edge
    let tupleToValueEdgeId: PrefixedNumber<EdgePrefix.MapValue> | undefined;
    if (valueId) {
      tupleToValueEdgeId = this.#defineEdge(
        tupleNodeId, EdgePrefix.MapValue, createValueDescription(value, this),
        valueMetadata === undefined ? null : valueMetadata,
        valueId, true, keyId
      );
    }

    return {
      tupleNodeId,
      mapToTupleEdgeId,
      tupleToKeyEdgeId,
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

    const registryToTupleEdgeId = this.#defineEdge(
      registryId, EdgePrefix.FinalizationRegistryToTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, undefined
    );

    const tupleToTargetEdgeId = this.#defineEdge(
      tupleNodeId, EdgePrefix.FinalizationToTarget, createValueDescription(target, this),
      null, targetId, false, undefined
    );

    let tupleToHeldValueEdgeId: PrefixedNumber<EdgePrefix.FinalizationToHeldValue> | undefined;
    if (heldValueId) {
      tupleToHeldValueEdgeId = this.#defineEdge(
        tupleNodeId, EdgePrefix.FinalizationToHeldValue,
        createValueDescription(heldValue, this),
        null, heldValueId, true, targetId
      );
    }

    let tupleToUnregisterTokenEdgeId: PrefixedNumber<EdgePrefix.FinalizationToUnregisterToken> | undefined;
    if (unregisterTokenId) {
      tupleToUnregisterTokenEdgeId = this.#defineEdge(
        tupleNodeId, EdgePrefix.FinalizationToUnregisterToken,
        createValueDescription(unregisterToken, this),
        null, unregisterTokenId, false, targetId
      );
    }

    return {
      tupleNodeId,
      registryToTupleEdgeId,
      tupleToTargetEdgeId,
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

    const objectToTupleEdgeId = this.#defineEdge(
      parentId, EdgePrefix.ObjectToPrivateTuple, ObjectGraphImpl.#NOT_APPLICABLE,
      null, tupleNodeId, true, undefined
    );

    const tupleToKeyEdgeId = this.#defineEdge(
      tupleNodeId, EdgePrefix.PrivateTupleToKey, ObjectGraphImpl.#NOT_APPLICABLE,
      privateNameMetadata, privateNameId, true, undefined
    );
    const tupleToValueEdgeId = this.#defineEdge(
      tupleNodeId,
      isGetter ? EdgePrefix.PrivateTupleToGetter : EdgePrefix.PrivateTupleToValue,
      createValueDescription(privateKey, this),
      childMetadata, childId, true, parentId
    );

    return {
      tupleNodeId,
      objectToTupleEdgeId,
      tupleToKeyEdgeId,
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
    if (isStrongReference && !this.#weakKeyIdsToVisit.has(childKey)) {
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
      const summaryGraph = new graphlib.Graph({ directed: true, multigraph: true });

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
        this.#summarizeGraphToTarget(summaryGraph, edgeIdToJointOwnersMap);
      }

      this.#graph = summaryGraph;
      this.#setNextState(ObjectGraphState.Summarized);
    } catch (ex) {
      this.#state = ObjectGraphState.Error;
      throw ex;
    }
  }

  #summarizeGraphToTarget(
    summaryGraph: graphlib.Graph,
    edgeIdToJointOwnersMap: ReadonlyMap<
      PrefixedNumber<EdgePrefix>,
      ReadonlySet<PrefixedNumber<NodePrefix>>
    >,
  ): void
  {
    const wNodeIds = new Set<GraphObjectId>([this.#targetId]);

    for (const id of wNodeIds) {
      const wNode = this.#graph.node(id);
      if (!summaryGraph.node(id)) {
        summaryGraph.setNode(id, wNode);
      }

      const edges = this.#graph.inEdges(id);
      if (!edges)
        continue;

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
  }
  //#endregion SearchReferencesIfc
}
