//#region preamble
import graphlib from "@dagrejs/graphlib";

import type {
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  ObjectId,
  PrefixedNumber,
  SymbolId,
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
  GraphEdgeWithMetadata,
  GraphNodeWithMetadata,
  GraphObjectId,
  MapKeyAndValueIds,
  ObjectGraphIfc,
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

export class ObjectGraphImpl<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
>
implements ObjectGraphIfc<object, symbol, ObjectMetadata, RelationshipMetadata>,
  CloneableGraphIfc, SearchReferencesIfc
{
  //#region private class fields
  #state: ObjectGraphState = ObjectGraphState.AcceptingDefinitions;
  #targetId: PrefixedNumber<"target">;
  #heldValuesId: PrefixedNumber<"heldValues">;
  #defineTargetCalled = false;

  #graph = new graphlib.Graph({ directed: true, multigraph: true });

  readonly #nodeCounter = new StringCounter<NodePrefix>;
  readonly #edgeCounter = new StringCounter<EdgePrefix>;
  readonly #symbolCounter = new StringCounter<"symbol">;

  readonly #nodeToIdMap = new WeakMap<object, GraphObjectId>;
  readonly #symbolToIdMap = new WeakMap<symbol, PrefixedNumber<"symbol">>;
  readonly #idToObjectOrSymbolMap = new Map<GraphObjectId | PrefixedNumber<"symbol">, object | symbol>;
  readonly #edgeIdToMetadataMap = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>>
  >;

  readonly #ownershipSetsTracker = new StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>(
    this.#ownershipResolver.bind(this)
  );
  readonly #edgeIdTo_IsStrongReference_Map = new Map<PrefixedNumber<EdgePrefix>, boolean>;
  readonly #objectHeldStronglyMap = new WeakMap<object, boolean>;
  readonly #objectIdsToVisit = new Set<PrefixedNumber<NodePrefix>>;

  readonly #edgeIdToJointOwnersMap_Weak = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlySet<PrefixedNumber<NodePrefix>>
  >;
  readonly #edgeIdToJointOwnersMap_Strong = new Map<
    PrefixedNumber<EdgePrefix>,
    ReadonlySet<PrefixedNumber<NodePrefix>>
  >;

  #searchedForStrongReferences = false;
  #strongReferenceCallback?: (object: object) => void;
  //#endregion private class fields

  constructor() {
    this.#targetId = "target:-1";
    this.#heldValuesId = "heldValues:-2";
  }

  public defineTargetAndHeldValues(
    target: object,
    targetMetadata: ObjectMetadata,
    heldValues: object,
    heldValuesMetadata: ObjectMetadata,
  )
  {
    this.#targetId = this.#defineObject(target, targetMetadata, NodePrefix.Target);
    this.#heldValuesId = this.#defineObject(heldValues, heldValuesMetadata, NodePrefix.HeldValues);

    this.#objectHeldStronglyMap.delete(target);
    this.#defineTargetCalled = true;
  }

  #assertDefineTargetCalled(): void {
    if (!this.#defineTargetCalled) {
      throw new Error("you must call defineTargetAndHeldValues first!");
    }
  }

  #setNextState(nextState: ObjectGraphState): void {
    this.#assertDefineTargetCalled();
    if (nextState >= this.#state) {
      this.#state = nextState;
    } else {
      this.#state = ObjectGraphState.Error;
      throw new Error("invalid state transition");
    }
  }

  //#region CloneableGraphIfc
  public cloneGraph(): graphlib.Graph {
    this.#assertDefineTargetCalled();
    return graphlib.json.read(graphlib.json.write(this.#graph));
  }
  //#endregion CloneableGraphIfc

  //#region ValueIdIfc
  public getObjectId(
    object: object
  ): ObjectId
  {
    this.#assertDefineTargetCalled();
    const id: GraphObjectId =  this.#requireObjectId(object, "object");
    if (id.startsWith("keyValueTuple"))
      throw new Error("object is a key-value tuple, how did you get it?");
    return id as ObjectId;
  }

  public getSymbolId(
    symbol: symbol
  ): SymbolId
  {
    this.#assertDefineTargetCalled();
    let symbolId = this.#symbolToIdMap.get(symbol);
    if (!symbolId) {
      symbolId = this.#symbolCounter.next("symbol");
      this.#symbolToIdMap.set(symbol, symbolId);
      this.#idToObjectOrSymbolMap.set(symbolId, symbol);
    }
    return symbolId
  }
  //#endregion ValueIdIfc

  //#region ObjectGraphIfc
  public hasObject(object: object): boolean {
    this.#assertDefineTargetCalled();
    return this.#nodeToIdMap.has(object);
  }

  public defineObject(
    object: object,
    metadata: ObjectMetadata
  ): void
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    if (this.#nodeToIdMap.has(object))
      throw new Error("object is already defined as a node in this graph");

    this.#defineObject(object, metadata, NodePrefix.Object);
  }

  #defineObject<Prefix extends NodePrefix>(
    object: object,
    metadata: ObjectMetadata | null,
    prefix: Prefix,
  ): PrefixedNumber<Prefix>
  {
    const nodeId = this.#nodeCounter.next(prefix);
    this.#nodeToIdMap.set(object, nodeId);
    this.#idToObjectOrSymbolMap.set(nodeId, object);

    const nodeMetadata: GraphNodeWithMetadata<ObjectMetadata | null> = { metadata };
    this.#graph.setNode(nodeId, nodeMetadata);

    this.#ownershipSetsTracker.defineKey(nodeId);
    this.#objectHeldStronglyMap.set(object, false);

    return nodeId;
  }

  #requireObjectId(
    object: object,
    identifier: string
  ): GraphObjectId
  {
    const id = this.#nodeToIdMap.get(object);
    if (!id)
      throw new Error(identifier + " is not defined as a node");
    return id;
  }

  #defineEdge(
    parentId: PrefixedNumber<NodePrefix>,
    childId: PrefixedNumber<NodePrefix>,
    edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata | null>,
    edgeId: PrefixedNumber<EdgePrefix>,
    jointOwnerKeys: readonly PrefixedNumber<NodePrefix>[],
  ): void
  {
    this.#graph.setEdge(parentId, childId, edgeMetadata, edgeId);
    this.#edgeIdToMetadataMap.set(
      edgeId,
      edgeMetadata as ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>>
    );

    if (childId === this.#targetId)
      this.#objectHeldStronglyMap.set(this.#idToObjectOrSymbolMap.get(this.#targetId) as object, false);

    const keySet = new Set(jointOwnerKeys);
    this.#edgeIdToJointOwnersMap_Weak.set(edgeId, keySet);
  }

  public defineProperty(
    parentObject: object,
    relationshipName: number | string | symbol,
    childObject: object,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.PropertyKey>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const parentId = this.#requireObjectId(parentObject, "parentObject");
    const childId = this.#requireObjectId(childObject, "childObject");

    let edgeId: PrefixedNumber<EdgePrefix.PropertyKey>;
    if (typeof relationshipName !== "symbol") {
      edgeId = this.#definePropertyReference(
        parentObject, relationshipName, childObject, metadata
      );
    } else {
      edgeId = this.#defineSymbolReference(
        parentObject, relationshipName, childObject, metadata
      );
    }

    this.#ownershipSetsTracker.defineChildEdge(
      childId, [parentId], edgeId
    );

    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, true);
    return edgeId;
  }

  #definePropertyReference(
    parentObject: object,
    relationshipName: number | string,
    childObject: object,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.PropertyKey>
  {
    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
      edgeType: EdgePrefix.PropertyKey,
      description: {
        valueType: ValueDiscrimant.Primitive,
        primitiveValue: relationshipName
      },
      metadata,
    };

    const parentId = this.#nodeToIdMap.get(parentObject)!;
    const childId = this.#nodeToIdMap.get(childObject)!
    const edgeId = this.#edgeCounter.next(EdgePrefix.PropertyKey);

    this.#defineEdge(
      parentId,
      childId,
      edgeMetadata,
      edgeId,
      [parentId]
    );
    return edgeId;
  }

  #defineSymbolReference(
    parentObject: object,
    symbolKey: symbol,
    childObject: object,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.PropertyKey>
  {
    const symbolId = this.getSymbolId(symbolKey);

    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
      edgeType: EdgePrefix.PropertyKey,
      description: {
        valueType: ValueDiscrimant.Symbol,
        symbolId,
      },
      metadata,
    };

    const edgeId = this.#edgeCounter.next(EdgePrefix.PropertyKey);
    this.#defineEdge(
      this.getObjectId(parentObject),
      this.getObjectId(childObject),
      edgeMetadata,
      edgeId,
      [this.getObjectId(parentObject)]
    );

    return edgeId;
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
    const parentId = this.#requireObjectId(parentObject, "parentObject");
    const childId = this.#requireObjectId(childObject, "childObject");
    const edgeId = this.#edgeCounter.next(EdgePrefix.InternalSlot);

    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
      edgeType: EdgePrefix.InternalSlot,
      description: {
        valueType: ValueDiscrimant.Primitive,
        primitiveValue: slotName
      },
      metadata,
    };

    this.#defineEdge(parentId, childId, edgeMetadata, edgeId, [parentId]);

    this.#ownershipSetsTracker.defineChildEdge(
      childId, [parentId], edgeId
    );

    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReference);
    return edgeId;
  }

  public defineMapKeyValueTuple(
    map: object,
    key: unknown,
    value: object,
    isStrongReferenceToKey: boolean,
    metadata: RelationshipMetadata,
  ): MapKeyAndValueIds
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const mapId = this.#requireObjectId(map, "map");

    let keyId: GraphObjectId | undefined;

    if (isObjectOrSymbol(key) === false && isStrongReferenceToKey === false) {
      throw new Error("key must be a WeakKey");
    }

    if (typeof key === "symbol") {
      keyId = undefined;
    } else if (isObjectOrSymbol(key)) {
      keyId = this.#requireObjectId(key as object, "key");
    }

    const valueId = this.#requireObjectId(value, "value");
    const tupleNodeId = this.#defineObject({}, null, NodePrefix.KeyValueTuple);

    // map to tuple
    const mapToTupleEdgeId = this.#edgeCounter.next(EdgePrefix.MapToTuple);
    {
      const edgeMetadata: GraphEdgeWithMetadata<null> = {
        edgeType: EdgePrefix.MapToTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: null,
      };

      this.#defineEdge(
        mapId,
        tupleNodeId,
        edgeMetadata,
        mapToTupleEdgeId,
        [mapId]
      );

      this.#ownershipSetsTracker.defineChildEdge(tupleNodeId, [mapId], mapToTupleEdgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(mapToTupleEdgeId, true);
    }

    const keyDescription: ValueDescription = createValueDescription(key, this);

    // map key edge
    let tupleToKeyEdgeId: PrefixedNumber<EdgePrefix.MapKey> | undefined;
    if (keyId) {
      tupleToKeyEdgeId = this.#edgeCounter.next(EdgePrefix.MapKey);
      const edgeMetadata: GraphEdgeWithMetadata<null> = {
        edgeType: EdgePrefix.MapKey,
        description: keyDescription,
        metadata: null,
      };

      this.#defineEdge(tupleNodeId, keyId, edgeMetadata, tupleToKeyEdgeId, [tupleNodeId]);

      this.#ownershipSetsTracker.defineChildEdge(keyId, [tupleNodeId], tupleToKeyEdgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(tupleToKeyEdgeId, isStrongReferenceToKey);
    }

    // map value edge
    const tupleToValueEdgeId = this.#edgeCounter.next(EdgePrefix.MapValue);
    {
      const description = createValueDescription(value, this);

      const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
        edgeType: EdgePrefix.MapValue,
        metadata,
        description,
      };

      const jointOwnerKeys = [mapId];
      if (keyId)
        jointOwnerKeys.push(keyId);
      this.#defineEdge(tupleNodeId, valueId, edgeMetadata, tupleToValueEdgeId, jointOwnerKeys);
      this.#ownershipSetsTracker.defineChildEdge(valueId, jointOwnerKeys, tupleToValueEdgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(tupleToValueEdgeId, true);
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
    value: object,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.SetValue>
  {
    this.#setNextState(ObjectGraphState.AcceptingDefinitions);
    const setId = this.#requireObjectId(set, "set");
    const valueId = this.#requireObjectId(value, "value");

    const edgeId = this.#edgeCounter.next(EdgePrefix.SetValue);
    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
      edgeType: EdgePrefix.SetValue,
      description: {
        valueType: ValueDiscrimant.NotApplicable,
      },
      metadata
    };

    this.#defineEdge(setId, valueId, edgeMetadata, edgeId, [setId]);

    this.#ownershipSetsTracker.defineChildEdge(
      valueId, [setId], edgeId
    );

    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReferenceToValue);
    return edgeId;
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
  setStrongReferenceCallback(callback: (object: object) => void) {
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
    if (isStrongReference && !this.#objectIdsToVisit.has(childKey)) {
      this.#objectIdsToVisit.add(childKey);
      const objectOrSymbol: object | symbol = this.#idToObjectOrSymbolMap.get(childKey)!;
      if (typeof objectOrSymbol === "object") {
        this.#objectHeldStronglyMap.set(objectOrSymbol, true);

        if (this.#strongReferenceCallback && childKey.startsWith("keyValueTuple") === false) {
          this.#strongReferenceCallback(objectOrSymbol);
        }
      }

      const keySet = new Set(jointOwnerKeys);
      this.#edgeIdToJointOwnersMap_Strong.set(edgeId, keySet);
    }

    void(tracker);
  }

  public markStrongReferencesFromHeldValues(): void {
    this.#setNextState(ObjectGraphState.MarkingStrongReferences);
    this.#searchedForStrongReferences = true;

    const heldValues = this.#idToObjectOrSymbolMap.get(this.#heldValuesId) as object;
    this.#objectHeldStronglyMap.set(heldValues, true);

    this.#objectIdsToVisit.add(this.#heldValuesId);
    try {
      for (const id of this.#objectIdsToVisit) {
        this.#ownershipSetsTracker.resolveKey(id);
      }

      this.#state = ObjectGraphState.MarkedStrongReferences;
    } catch (ex) {
      this.#state = ObjectGraphState.Error;
      throw ex;
    }
  }

  public isObjectHeldStrongly(object: object): boolean {
    this.#assertDefineTargetCalled();
    if (!this.#searchedForStrongReferences) {
      throw new Error("You haven't searched for strong references yet.");
    }
    this.#setNextState(ObjectGraphState.MarkedStrongReferences);
    return this.#objectHeldStronglyMap.get(object) ?? false;
  }

  public summarizeGraphToTarget(
    strongReferencesOnly: boolean,
  ): void
  {
    this.#setNextState(ObjectGraphState.Summarizing);
    try {
      const summaryGraph = new graphlib.Graph({ directed: true, multigraph: true });

      const target = this.#idToObjectOrSymbolMap.get(this.#targetId) as object;
      const targetReference: boolean | undefined = this.#objectHeldStronglyMap.get(target);

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
