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

/**
 * Conversions from ECMAScript values to graph nodes and edges.
 *
 * @typeParam ObjectMetadata - metadata to store with the graph node.
 * @typeParam RelationshipMetadata - metadata to store with a graph edge.
 *
 * @remarks
 *
 * You may notice there is no `GuestEngine` here, nor `ObjectId`, `SymbolId` or
 * `ReferenceId`.  This is deliberate.  This interface builds a graph using
 * these id's, and the use of these types here confuses the abstractions, making
 * testing this harder.
 */
export interface ObjectGraphIfc<
  EngineObject,
  EngineSymbol,
  EnginePrivateName,
  ObjectOrSymbolMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
> extends ValueIdIfc<EngineObject, EngineSymbol>
{
  defineTargetAndHeldValues(
    target: EngineWeakKey<EngineObject, EngineSymbol>,
    targetMetadata: ObjectOrSymbolMetadata,
    heldValues: EngineObject,
    heldValuesMetadata: ObjectOrSymbolMetadata,
  ): void;

  hasObject(
    object: EngineObject
  ): boolean;

  hasSymbol(
    symbol: EngineSymbol
  ): boolean;

  hasPrivateName(
    privateName: EnginePrivateName
  ): boolean;

  defineObject(
    object: EngineObject,
    metadata: ObjectOrSymbolMetadata
  ): void;

  defineSymbol(
    symbol: EngineSymbol,
    metadata: ObjectOrSymbolMetadata
  ): void;

  definePrivateName(
    privateName: EnginePrivateName,
    description: `#${string}`,
  ): void;

  /**
   * `const target = Symbol("key"); obj[target] = true;`
   * @param parentObject
   * @param relationshipName
   * @param keyEdgeMetadata
   */
  defineAsSymbolKey(
    parentObject: EngineObject,
    relationshipName: EngineSymbol,
    keyEdgeMetadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.HasSymbolAsKey>;

  /**
   *
   * @param parentObject
   * @param relationshipName
   * @param childObject
   * @param metadata
   * @param isGetter
   */
  definePropertyOrGetter(
    parentObject: EngineObject,
    relationshipName: number | string | EngineSymbol,
    childObject: EngineWeakKey<EngineObject, EngineSymbol>,
    metadata: RelationshipMetadata,
    isGetter: boolean,
  ): PrefixedNumber<EdgePrefix.GetterKey | EdgePrefix.PropertyKey>;

  defineConstructorOf(
    instanceObject: EngineObject,
    ctorObject: EngineObject,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.InstanceOf>;

  defineScopeValue(
    functionObject: EngineObject,
    identifier: string,
    objectValue: EngineWeakKey<EngineObject, EngineSymbol>,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.ScopeValue>;

  /**
   *
   * @param parentObject
   * @param relationshipName
   * @param childObject
   * @param isStrongReference
   * @param metadata
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
   */
  defineMapKeyValueTuple(
    map: EngineObject,
    key: unknown,
    value: unknown,
    isStrongReferenceToKey: boolean,
    keyMetadata: RelationshipMetadata | undefined,
    valueMetadata: RelationshipMetadata | undefined,
  ): MapKeyAndValueIds;

  definePrivateField(
    parentObject: EngineObject,
    privateName: EnginePrivateName,
    privateKey: `#${string}`,
    childObject: EngineWeakKey<EngineObject, EngineSymbol>,
    privateNameMetadata: RelationshipMetadata,
    childMetadata: RelationshipMetadata,
    isGetter: boolean
  ): PrivateFieldTupleIds;

  /**
   * Define a reference between a set and a value.
   *
   * @param set
   * @param value
   * @param isStrongReferenceToValue
   * @param metadata
   */
  defineSetValue(
    set: EngineObject,
    value: EngineWeakKey<EngineObject, EngineSymbol>,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata,
  ): PrefixedNumber<EdgePrefix.SetValue>;

  defineFinalizationTuple(
    registry: EngineObject,
    target: EngineWeakKey<EngineObject, EngineSymbol>,
    heldValue: unknown,
    unregisterToken: EngineWeakKey<EngineObject, EngineSymbol> | undefined,
  ): FinalizationTupleIds;

  getEdgeRelationship(
    edgeId: PrefixedNumber<EdgePrefix>
  ): ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>> | undefined;
}

export interface GraphNodeWithMetadata<ObjectMetadata extends JsonObject | null> {
  metadata: ObjectMetadata,
  width: number,
  height: number,
}

export interface GraphEdgeWithMetadata<RelationshipMetadata extends JsonObject | null> {
  label: string;
  edgeType: EdgePrefix;
  description: ValueDescription;
  metadata: RelationshipMetadata;
}

export type GraphObjectId = PrefixedNumber<NodePrefix>;
export type EngineWeakKey<EngineObject, EngineSymbol> = EngineObject | EngineSymbol;

export interface MapKeyAndValueIds {
  readonly tupleNodeId: PrefixedNumber<NodePrefix.KeyValueTuple>;
  readonly mapToKeyEdgeId: PrefixedNumber<EdgePrefix.MapKey> | undefined;
  readonly mapToTupleEdgeId: PrefixedNumber<EdgePrefix.MapToTuple>;
  readonly keyToTupleEdgeId: PrefixedNumber<EdgePrefix.MapKeyToTuple> | undefined;
  readonly tupleToValueEdgeId: PrefixedNumber<EdgePrefix.MapValue> | undefined;
}

export interface PrivateFieldTupleIds {
  readonly tupleNodeId: PrefixedNumber<NodePrefix.PrivateFieldTuple>;
  readonly objectToPrivateKeyEdgeId: PrefixedNumber<EdgePrefix.ObjectToPrivateKey>;
  readonly objectToTupleEdgeId: PrefixedNumber<EdgePrefix.ObjectToPrivateTuple>;
  readonly privateKeyToTupleEdgeId: PrefixedNumber<EdgePrefix.PrivateKeyToTuple>;
  readonly tupleToValueEdgeId: PrefixedNumber<EdgePrefix.PrivateTupleToValue | EdgePrefix.PrivateTupleToGetter>;
}

export interface FinalizationTupleIds {
  readonly tupleNodeId: PrefixedNumber<NodePrefix.FinalizationTuple>;
  readonly registryToTupleEdgeId: PrefixedNumber<EdgePrefix.FinalizationRegistryToTuple>;
  readonly tupleToTargetEdgeId: PrefixedNumber<EdgePrefix.FinalizationToTarget>;
  readonly tupleToHeldValueEdgeId: PrefixedNumber<EdgePrefix.FinalizationToHeldValue> | undefined;
  readonly tupleToUnregisterTokenEdgeId: PrefixedNumber<EdgePrefix.FinalizationToUnregisterToken> | undefined;
}

export interface ValueIdIfc<EngineObject, EngineSymbol> {
  getWeakKeyId(
    weakKey: EngineWeakKey<EngineObject, EngineSymbol>
  ): ObjectId | SymbolId;
}
