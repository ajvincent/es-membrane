//#region preamble
import type {
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  GraphEdgeWithMetadata,
  MapKeyAndValueIds,
  ObjectGraphIfc
} from "../../graph-analysis/types/ObjectGraphIfc.js";

import type {
  PrefixedNumber,
  ObjectId,
  SymbolId,
} from "../../types/PrefixedNumber.js";

import type {
  EdgePrefix
} from "../../utilities/constants.js";

import {
  GuestEngine
} from "./GuestEngine.js";

import {
  HostValueSubstitution
} from "./HostValueSubstitution.js";
//#endregion preamble

interface GuestObjectGraphIfc<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null
>
extends Omit<
  ObjectGraphIfc<
    GuestEngine.ObjectValue,
    GuestEngine.SymbolValue,
    ObjectMetadata,
    RelationshipMetadata
  >, "defineProperty"
>
{
  defineProperty(
    parentObject: GuestEngine.ObjectValue,
    relationshipName:  GuestEngine.NumberValue | GuestEngine.JSStringValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.PropertyKey>;
}

export class GuestObjectGraphImpl<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null
>
implements GuestObjectGraphIfc<ObjectMetadata, RelationshipMetadata>
{
  readonly #hostGraph: ObjectGraphIfc<object, symbol, ObjectMetadata, RelationshipMetadata>;
  readonly #substitution = new HostValueSubstitution;

  constructor(
    hostGraph: ObjectGraphIfc<object, symbol, ObjectMetadata, RelationshipMetadata>
  )
  {
    this.#hostGraph = hostGraph;
  }

  public getObjectId(object: GuestEngine.ObjectValue): ObjectId {
    return this.#hostGraph.getObjectId(
      this.#substitution.getHostObject(object)
    );
  }

  public getSymbolId(
    symbol: GuestEngine.SymbolValue
  ): SymbolId
  {
    return this.#hostGraph.getSymbolId(
      this.#substitution.getHostSymbol(symbol)
    );
  }

  public hasObject(
    object: GuestEngine.ObjectValue
  ): boolean
  {
    return this.#hostGraph.hasObject(
      this.#substitution.getHostObject(object)
    );
  }

  public defineObject(
    object: GuestEngine.ObjectValue,
    metadata: ObjectMetadata
  ): void
  {
    return this.#hostGraph.defineObject(
      this.#substitution.getHostObject(object),
      metadata
    );
  }

  public defineProperty(
    parentObject: GuestEngine.ObjectValue,
    relationshipName: GuestEngine.JSStringValue | GuestEngine.NumberValue | GuestEngine.SymbolValue,
    childObject: GuestEngine.ObjectValue,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.PropertyKey>
  {
    return this.#hostGraph.defineProperty(
      this.#substitution.getHostObject(parentObject),
      this.#substitution.getHostPropertyKey(relationshipName),
      this.#substitution.getHostObject(childObject),
      metadata
    );
  }

  public defineInternalSlot(
    parentObject: GuestEngine.ObjectValue,
    slotName: `[[${string}]]`,
    childObject: GuestEngine.ObjectValue,
    isStrongReference: boolean,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.InternalSlot>
  {
    return this.#hostGraph.defineInternalSlot(
      this.#substitution.getHostObject(parentObject),
      slotName,
      this.#substitution.getHostObject(childObject),
      isStrongReference,
      metadata
    );
  }

  public defineMapKeyValueTuple(
    map: GuestEngine.ObjectValue,
    key: GuestEngine.Value,
    value: GuestEngine.ObjectValue,
    isStrongReferenceToKey: boolean,
    metadata: RelationshipMetadata
  ): MapKeyAndValueIds
  {
    return this.#hostGraph.defineMapKeyValueTuple(
      this.#substitution.getHostObject(map),
      this.#substitution.getHostValue(key),
      this.#substitution.getHostObject(value),
      isStrongReferenceToKey,
      metadata
    );
  }

  public defineSetValue(
    set: GuestEngine.ObjectValue,
    value: GuestEngine.ObjectValue,
    isStrongReferenceToValue: boolean,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.SetValue>
  {
    return this.#hostGraph.defineSetValue(
      this.#substitution.getHostObject(set),
      this.#substitution.getHostObject(value),
      isStrongReferenceToValue,
      metadata,
    )
  }

  public getEdgeRelationship(
    edgeId: PrefixedNumber<EdgePrefix>
  ): ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>> | undefined
  {
    return this.#hostGraph.getEdgeRelationship(edgeId);
  }
}
