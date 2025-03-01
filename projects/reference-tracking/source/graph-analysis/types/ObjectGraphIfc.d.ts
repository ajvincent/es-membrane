import type {
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  ObjectId,
  PrefixedNumber,
  SymbolId,
} from "../../types/PrefixedNumber.js";

import type {
  NodePrefix,
  EdgePrefix,
} from "../../utilities/constants.js";

import type {
  ValueDescription,
} from "../../types/ValueDescription.js";

export interface GraphNodeWithMetadata<ObjectMetadata extends JsonObject | null> {
  metadata: ObjectMetadata
}

export interface GraphEdgeWithMetadata<RelationshipMetadata extends JsonObject | null> {
  edgeType: EdgePrefix,
  description: ValueDescription,
  metadata: RelationshipMetadata
}

export type GraphObjectId = PrefixedNumber<NodePrefix>;

export interface MapKeyAndValueIds {
  readonly tupleNodeId: PrefixedNumber<NodePrefix.KeyValueTuple>;
  readonly mapToTupleEdgeId: PrefixedNumber<EdgePrefix.MapToTuple>;
  readonly tupleToKeyEdgeId: PrefixedNumber<EdgePrefix.MapKey> | undefined;
  readonly tupleToValueEdgeId: PrefixedNumber<EdgePrefix.MapValue>;
}

export interface ValueIdIfc<EngineObject, EngineSymbol> {
  getObjectId(
    object: EngineObject
  ): ObjectId;

  getSymbolId(
    symbol: EngineSymbol
  ): SymbolId;
}

/**
 * Conversions from ECMAScript values to graph nodes and edges.
 *
 * @typeParam ObjectMetadata - metadata to store with the graph node.
 * @typeParam RelationshipMetadata - metadata to store with a graph edge.
 *
 * @remarks
 *
 * You may notice there is no `GuestEngine` here, nor `ObjectId` and `ReferenceId`.
 * This is deliberate.  This interface builds a graph using these id's, and `GuestEngine`
 * usage here confuses the abstractions, making testing this harder.
 */
export interface ObjectGraphIfc<
  EngineObject,
  EngineSymbol,
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
> extends ValueIdIfc<EngineObject, EngineSymbol>
{
  hasObject(
    object: EngineObject
  ): boolean;

  defineObject(
    object: EngineObject,
    metadata: ObjectMetadata
  ): void;

  /**
   *
   * @param parentObject
   * @param relationshipName
   * @param childObject
   * @param metadata
   *
   * @privateRemarks Enclose the metadata in an object with the key `reference`.
   */
  defineProperty(
    parentObject: EngineObject,
    relationshipName: number | string | EngineSymbol,
    childObject: EngineObject,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.PropertyKey>;

  /**
   *
   * @param parentObject
   * @param relationshipName
   * @param childObject
   * @param isStrongReference
   * @param metadata
   *
   * @privateRemarks Enclose the metadata in an object with the key `slot`.
   */
  defineInternalSlot(
    parentObject: EngineObject,
    slotName: `[[${string}]]`,
    childObject: EngineObject,
    isStrongReference: boolean,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.InternalSlot>;

  /**
   * Define a relationship between a map, a key and a value.
   * @param map
   * @param key
   * @param value
   * @param isStrongReferenceToKey
   * @param metadata
   *
   * @remarks
   *
   * The map will have a strong reference to an intermediate node, which will
   * then have references to the key and value.  The map and the key will
   * jointly own the value.  The intermediate node will own the key, strongly
   * only if `isStrongReferenceToKey`. The map will strongly own the
   * intermediate node.
   *
   * @privateRemarks Enclose the metadata in an object with the key `map`.
   */
  defineMapKeyValueTuple(
    map: EngineObject,
    key: unknown,
    value: EngineObject,
    isStrongReferenceToKey: boolean,
    metadata: RelationshipMetadata,
  ): MapKeyAndValueIds;

  /**
   * Define a reference between a set and a value.
   *
   * @param set
   * @param value
   * @param isStrongReferenceToValue
   * @param metadata
   *
   * @privateRemarks Enclose the metadata in an object with the key `set`.
   */
  defineSetValue(
    set: EngineObject,
    value: EngineObject,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.SetValue>;

  getEdgeRelationship(
    edgeId: PrefixedNumber<EdgePrefix>
  ): ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>> | undefined;
}
