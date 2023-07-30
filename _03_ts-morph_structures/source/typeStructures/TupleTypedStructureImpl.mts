import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import {
  TupleTypedStructure
} from "./TypeStructure.mjs";

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "./callbackToTypeStructureRegistry.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";
import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

export default class TupleTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TupleTypedStructure
{
  static clone(
    other: TupleTypedStructure
  ): TupleTypedStructureImpl
  {
    const rv = new TupleTypedStructureImpl;
    rv.elements = other.elements.map(
      typeStructure => cloneableClassesMap.get(typeStructure.kind)!.clone(typeStructure)
    );
    return rv;
  }

  readonly kind: TypeStructureKind.Tuple = TypeStructureKind.Tuple;

  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";

  constructor()
  {
    super();
    registerCallbackForTypeStructure(this);
  }
}
TupleTypedStructureImpl satisfies CloneableStructure<TupleTypedStructure>;

cloneableClassesMap.set(TypeStructureKind.Tuple, TupleTypedStructureImpl);
