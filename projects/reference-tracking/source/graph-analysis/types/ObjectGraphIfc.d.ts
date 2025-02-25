import {
  JsonObject
} from "type-fest";

export interface ObjectGraphIfc<
  ObjectMetadata extends JsonObject,
  RelationshipMetadata extends JsonObject,
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

  defineReference(
    parentObject: object,
    relationshipName: number | string | symbol,
    childObject: object,
    metadata: RelationshipMetadata,
  ): void;

  defineCollectionKeyValue(
    collection: ReadonlyMap<unknown, unknown> | ReadonlySet<unknown> | WeakMap<object, unknown> | WeakSet<object>,
    key: unknown,
    value: object,
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

  // placeholder, to be removed from this interface
  defineGraphStyling(): never;
}
