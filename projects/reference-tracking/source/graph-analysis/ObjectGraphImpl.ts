//#region preamble
import graphlib from "@dagrejs/graphlib";

import type {
  JsonObject
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
  ObjectGraphIfc,
} from "./types/ObjectGraphIfc.js";

type SetsTracker = StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>;

//#endregion internal types

export class ObjectGraphImpl<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
>
implements ObjectGraphIfc<ObjectMetadata, RelationshipMetadata>, CloneableGraphIfc
{
  //#region private class fields
  readonly #rawGraph = new graphlib.Graph({ directed: true, multigraph: true });

  readonly #nodeCounter = new StringCounter<NodePrefix>;
  readonly #edgeCounter = new StringCounter<EdgePrefix>;
  readonly #symbolCounter = new StringCounter<"symbol">;

  readonly #nodeToIdMap = new WeakMap<object, GraphObjectId>;
  readonly #symbolToIdMap = new WeakMap<symbol, PrefixedNumber<"symbol">>;

  readonly #ownershipSetsTracker = new StrongOwnershipSetsTracker<GraphObjectId, PrefixedNumber<EdgePrefix>>(
    this.#ownershipResolver.bind(this)
  );
  readonly #edgeIdTo_IsStrongReference_Map = new Map<PrefixedNumber<EdgePrefix>, boolean>;
  //readonly #reachableObjects = new WeakMap<object, boolean>;
  //#endregion private class fields

  constructor(
    target: object,
    targetMetadata: ObjectMetadata,
    heldValues: object[],
    heldValuesMetadata: ObjectMetadata,
  )
  {
    this.#defineObject(target, targetMetadata, NodePrefix.Target);
    this.#defineObject(heldValues, heldValuesMetadata, NodePrefix.HeldValues);
  }

  //#region CloneableGraphIfc
  public cloneGraph(): graphlib.Graph {
    return graphlib.json.read(graphlib.json.write(this.#rawGraph));
  }
  //#endregion CloneableGraphIfc

  //#region ValueIdIfc
  public getObjectId(
    object: object
  ): ObjectId
  {
    const id: GraphObjectId =  this.#requireObjectId(object, "object");
    if (id.startsWith("keyValueTuple"))
      throw new Error("object is a key-value tuple, how did you get it?");
    return id as ObjectId;
  }

  public getSymbolId(
    symbol: symbol
  ): SymbolId
  {
    let symbolId = this.#symbolToIdMap.get(symbol);
    if (!symbolId) {
      symbolId = this.#symbolCounter.next("symbol");
      this.#symbolToIdMap.set(symbol, symbolId);
    }
    return symbolId
  }
  //#endregion ValueIdIfc

  //#region ObjectGraphIfc
  public hasObject(object: object): boolean {
    return this.#nodeToIdMap.has(object);
  }

  public defineObject(
    object: object,
    metadata: ObjectMetadata
  ): void
  {
    if (this.#nodeToIdMap.has(object))
      throw new Error("object is already defined as a node in this graph");

    this.#defineObject(object, metadata, NodePrefix.Object);
  }

  #defineObject(
    object: object,
    metadata: ObjectMetadata | null,
    prefix: NodePrefix,
  ): PrefixedNumber<NodePrefix>
  {
    const nodeId = this.#nodeCounter.next(prefix);
    this.#nodeToIdMap.set(object, nodeId);

    const nodeMetadata: GraphNodeWithMetadata<ObjectMetadata | null> = { metadata };
    this.#rawGraph.setNode(nodeId, nodeMetadata);

    this.#ownershipSetsTracker.defineKey(nodeId);

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

  public defineReference(
    parentObject: object,
    relationshipName: number | string | symbol,
    childObject: object,
    metadata: RelationshipMetadata
  ): void
  {
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

    this.#rawGraph.setEdge(
      parentId,
      childId,
      edgeMetadata,
      edgeId
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
    this.#rawGraph.setEdge(
      this.#nodeToIdMap.get(parentObject)!,
      this.#nodeToIdMap.get(childObject)!,
      edgeMetadata,
      edgeId
    );

    return edgeId;
  }

  public defineInternalSlot(
    parentObject: object,
    slotName: `[[${string}]]`,
    childObject: object,
    isStrongReference: boolean,
    metadata: RelationshipMetadata,
  ): void
  {
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

    this.#rawGraph.setEdge(
      parentId,
      childId,
      edgeMetadata,
      edgeId
    );

    this.#ownershipSetsTracker.defineChildEdge(
      childId, [parentId], edgeId
    );

    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReference);
  }

  public defineMapKeyValueTuple(
    map: object,
    key: unknown,
    value: object,
    isStrongReferenceToKey: boolean,
    metadata: RelationshipMetadata,
  ): void
  {
    const mapId = this.#requireObjectId(map, "map");

    let keyId: GraphObjectId | undefined;
    if (isStrongReferenceToKey === false) {
      const keyType = typeof key;
      if ((keyType !== "object") && (keyType !== "function") && (keyType !== "symbol")) {
        throw new Error("key must be a WeakKey");
      }
      keyId = this.#requireObjectId(key as object, "key");
    }

    const valueId = this.#requireObjectId(value, "value");
    const tupleId = this.#defineObject({}, null, NodePrefix.KeyValueTuple);

    // map to tuple
    {
      const edgeId = this.#edgeCounter.next(EdgePrefix.MapToTuple);
      const edgeMetadata: GraphEdgeWithMetadata<null> = {
        edgeType: EdgePrefix.MapToTuple,
        description: {
          valueType: ValueDiscrimant.NotApplicable
        },
        metadata: null,
      };

      this.#rawGraph.setEdge(
        mapId,
        tupleId,
        edgeMetadata,
        edgeId
      );

      this.#ownershipSetsTracker.defineChildEdge(tupleId, [mapId], edgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(edgeId, true);
    }

    const keyDescription: ValueDescription = createValueDescription(key, this);

    // map key edge
    if (keyId) {
      const edgeId = this.#edgeCounter.next(EdgePrefix.MapKey);
      const edgeMetadata: GraphEdgeWithMetadata<null> = {
        edgeType: EdgePrefix.MapKey,
        description: keyDescription,
        metadata: null,
      };

      this.#rawGraph.setEdge(
        tupleId,
        keyId,
        edgeMetadata,
        edgeId
      );

      this.#ownershipSetsTracker.defineChildEdge(keyId, [tupleId], edgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReferenceToKey);
    }

    // map value edge
    {
      const edgeId = this.#edgeCounter.next(EdgePrefix.MapValue);
      const description = createValueDescription(value, this);

      const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
        edgeType: EdgePrefix.MapValue,
        metadata,
        description,
      };

      this.#rawGraph.setEdge(
        tupleId,
        valueId,
        edgeMetadata,
        edgeId
      );

      const jointOwnerKeys = [mapId];
      if (keyId)
        jointOwnerKeys.push(keyId);
      this.#ownershipSetsTracker.defineChildEdge(valueId, jointOwnerKeys, edgeId);
      this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReferenceToKey);
    }
  }

  public defineSetValue(
    set: object,
    value: object,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata
  ): void
  {
    const setId = this.#requireObjectId(set, "set");
    const valueId = this.#requireObjectId(value, "value");

    const edgeId = this.#edgeCounter.next(EdgePrefix.SetValue);
    const edgeMetadata: GraphEdgeWithMetadata<RelationshipMetadata> = {
      edgeType: EdgePrefix.SetValue,
      description: createValueDescription(value, this),
      metadata
    };

    this.#rawGraph.setEdge(
      setId,
      valueId,
      edgeMetadata,
      edgeId
    );

    this.#ownershipSetsTracker.defineChildEdge(
      valueId, [setId], edgeId
    );

    this.#edgeIdTo_IsStrongReference_Map.set(edgeId, isStrongReferenceToValue);
  }

  #ownershipResolver(
    childKey: GraphObjectId,
    jointOwnerKeys: readonly GraphObjectId[],
    context: PrefixedNumber<EdgePrefix>,
    tracker: SetsTracker
  ): void
  {
    void(tracker);
  }

  public markStrongReference(object: object): void {
    void(object);
    throw new Error("Method not implemented.");
  }

  public resolveStrongReferences(): void {
    throw new Error("Method not implemented.");
  }

  public hasStrongReference(object: object): boolean {
    void(object);
    throw new Error("Method not implemented.");
  }

  public isReachable(
    source: object,
    target: object,
    strongReferencesOnly: boolean
  ): boolean
  {
    void(source);
    void(target);
    void(strongReferencesOnly);
    throw new Error("Method not implemented.");
  }
  //#endregion ObjectGraphIfc
}
