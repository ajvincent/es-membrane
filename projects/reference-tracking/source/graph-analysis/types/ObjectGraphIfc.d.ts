import {
  JsonObject
} from "type-fest";

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
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null,
>
{
  //#region directed graph operations
  hasObject(
    object: object
  ): boolean;

  defineObject(
    object: object,
    metadata: ObjectMetadata
  ): void;

  /**
   *
   * @param parentObject
   * @param relationshipName
   * @param childObject
   * @param isStrongReference
   * @param metadata
   *
   * @privateRemarks Enclose the metadata in an object with the key `reference`.
   */
  defineReference(
    parentObject: object,
    relationshipName: number | string | symbol,
    childObject: object,
    isStrongReference: boolean,
    metadata: RelationshipMetadata,
  ): void;

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
    map: object,
    key: unknown,
    value: object,
    isStrongReferenceToKey: boolean,
    metadata: RelationshipMetadata,
  ): void;

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
  defineSetValueTuple(
    set: object,
    value: object,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata,
  ): void;
  //#endregion directed graph operations

  //#region strong references
  markStrongReference(
    object: object
  ): void;

  resolveStrongReferences(): void;

  hasStrongReference(
    object: object
  ): boolean;
  //#endregion strong references

  isReachable(
    source: object,
    target: object,
    strongReferencesOnly: boolean
  ): boolean;

  /*
  // placeholder, to be removed from this interface
  defineGraphStyling(): never;

  // placeholder, to be removed from this interface
  cloneGraph(): never;
  */
}
