//#region preamble
import type {
  JsonObject,
  ReadonlyDeep,
} from "type-fest";

import type {
  EngineWeakKey,
  FinalizationTupleIds,
  GraphEdgeWithMetadata,
  MapKeyAndValueIds,
  ObjectGraphIfc,
  PrivateFieldTupleIds,
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
} from "../host-to-guest/GuestEngine.js";

import type {
  GuestObjectGraphIfc
} from "../types/GuestObjectGraphIfc.js";

import {
  HostValueSubstitution
} from "./HostValueSubstitution.js";
//#endregion preamble

export class GuestObjectGraphImpl<
  ObjectMetadata extends JsonObject | null,
  RelationshipMetadata extends JsonObject | null
>
implements GuestObjectGraphIfc<ObjectMetadata, RelationshipMetadata>
{
  readonly #hostGraph: ObjectGraphIfc<object, symbol, ObjectMetadata, RelationshipMetadata>;
  readonly #substitution = new HostValueSubstitution;

  readonly #internalErrorTrap?: () => void;

  constructor(
    hostGraph: ObjectGraphIfc<object, symbol, ObjectMetadata, RelationshipMetadata>,
    internalErrorTrap?: () => void,
  )
  {
    this.#hostGraph = hostGraph;
    this.#internalErrorTrap = internalErrorTrap;
  }

  #throwInternalError(error: Error): never {
    if (this.#internalErrorTrap) {
      this.#internalErrorTrap();
    }
    throw error;
  }

  public defineTargetAndHeldValues(
    target: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    targetMetadata: ObjectMetadata,
    heldValues: GuestEngine.ObjectValue,
    heldValuesMetadata: ObjectMetadata
  ): void
  {
    this.#hostGraph.defineTargetAndHeldValues(
      this.#substitution.getHostWeakKey(target),
      targetMetadata,
      this.#substitution.getHostObject(heldValues),
      heldValuesMetadata
    );
  }

  public getWeakKeyId(
    weakKey: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>
  ): ObjectId | SymbolId
  {
    let hostKey: object | symbol;
    if (weakKey.type === "Object")
      hostKey = this.#substitution.getHostObject(weakKey);
    else
      hostKey = this.#substitution.getHostSymbol(weakKey);
    return this.#hostGraph.getWeakKeyId(hostKey);
  }

  public hasObject(
    object: GuestEngine.ObjectValue
  ): boolean
  {
    return this.#hostGraph.hasObject(
      this.#substitution.getHostObject(object)
    );
  }

  public hasSymbol(
    symbol: GuestEngine.SymbolValue
  ): boolean
  {
    return this.#hostGraph.hasSymbol(
      this.#substitution.getHostSymbol(symbol)
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

  public defineSymbol(
    symbol: GuestEngine.SymbolValue,
    metadata: ObjectMetadata
  ): void
  {
    return this.#hostGraph.defineSymbol(
      this.#substitution.getHostSymbol(symbol),
      metadata
    );
  }

  public definePrivateName(
    privateName: GuestEngine.PrivateName,
    description: string
  ): void
  {
    return this.#hostGraph.definePrivateName(
      this.#substitution.getHostPrivateName(privateName),
      description
    );
  }

  public defineAsSymbolKey(
    parentObject: GuestEngine.ObjectValue,
    relationshipName: GuestEngine.SymbolValue,
    keyEdgeMetadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.HasSymbolAsKey>
  {
    return this.#hostGraph.defineAsSymbolKey(
      this.#substitution.getHostObject(parentObject),
      this.#substitution.getHostSymbol(relationshipName),
      keyEdgeMetadata
    );
  }

  public definePropertyOrGetter(
    parentObject: GuestEngine.ObjectValue,
    guestRelationshipName: string | number | GuestEngine.SymbolValue,
    childObject: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    metadata: RelationshipMetadata,
    isGetter: boolean
  ): PrefixedNumber<EdgePrefix.GetterKey | EdgePrefix.PropertyKey>
  {
    let relationshipName: string | number | symbol;
    if (typeof guestRelationshipName === "object") {
      relationshipName = this.#substitution.getHostSymbol(guestRelationshipName);
    }
    else {
      relationshipName = guestRelationshipName;
    }

    return this.#hostGraph.definePropertyOrGetter(
      this.#substitution.getHostObject(parentObject),
      relationshipName,
      this.#substitution.getHostWeakKey(childObject),
      metadata,
      isGetter
    );
  }

  public defineConstructorOf(
    instanceObject: GuestEngine.ObjectValue,
    ctorObject: GuestEngine.ObjectValue,
    metadata: RelationshipMetadata
  ): PrefixedNumber<EdgePrefix.InstanceOf>
  {
    if (!GuestEngine.IsConstructor(ctorObject)) {
      this.#throwInternalError(new Error("ctorObject is not a constructor"));
    }

    // preserving the graph order, though the graph _should_ have instanceObject already
    const hostInstance = this.#substitution.getHostObject(instanceObject);
    const hostCtor = this.#substitution.getHostObject(ctorObject);
    if (typeof hostCtor !== "function") {
      this.#throwInternalError(new Error("assertion failure: hostCtor should be a function"));
    }

    return this.#hostGraph.defineConstructorOf(
      hostInstance,
      hostCtor,
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
    value: GuestEngine.Value,
    isStrongReferenceToKey: boolean,
    keyMetadata: RelationshipMetadata,
    valueMetadata: RelationshipMetadata
  ): MapKeyAndValueIds
  {
    return this.#hostGraph.defineMapKeyValueTuple(
      this.#substitution.getHostObject(map),
      this.#substitution.getHostValue(key),
      this.#substitution.getHostValue(value),
      isStrongReferenceToKey,
      keyMetadata,
      valueMetadata
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

  public defineFinalizationTuple(
    registry: GuestEngine.ObjectValue,
    target: GuestEngine.ObjectValue,
    heldValue: GuestEngine.Value,
    unregisterToken: GuestEngine.ObjectValue | undefined
  ): FinalizationTupleIds
  {
    return this.#hostGraph.defineFinalizationTuple(
      this.#substitution.getHostObject(registry),
      this.#substitution.getHostObject(target),
      this.#substitution.getHostValue(heldValue),
      unregisterToken ? this.#substitution.getHostObject(unregisterToken) : undefined,
    )
  }

  public definePrivateField(
    parentObject: GuestEngine.ObjectValue,
    privateName: GuestEngine.PrivateName,
    childObject: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
    metadata: RelationshipMetadata,
    isGetter: boolean
  ): PrivateFieldTupleIds
  {
    return this.#hostGraph.definePrivateField(
      this.#substitution.getHostObject(parentObject),
      this.#substitution.getHostPrivateName(privateName),
      this.#substitution.getHostWeakKey(childObject),
      metadata,
      isGetter
    );
  }

  public getEdgeRelationship(
    edgeId: PrefixedNumber<EdgePrefix>
  ): ReadonlyDeep<GraphEdgeWithMetadata<RelationshipMetadata | null>> | undefined
  {
    return this.#hostGraph.getEdgeRelationship(edgeId);
  }
}
