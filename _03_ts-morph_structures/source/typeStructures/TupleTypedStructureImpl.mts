// #region preamble
import ElementsTypedStructureAbstract from "./ElementsTypedStructureAbstract.mjs";

import type {
  TupleTypedStructure,
  TypeStructures
} from "./TypeStructures.mjs";

import TypeStructureClassesMap from "../base/TypeStructureClassesMap.mjs";

import {
  TypeStructureKind
} from "../base/TypeStructureKind.mjs";

import {
  registerCallbackForTypeStructure
} from "../base/callbackToTypeStructureRegistry.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
// #endregion preamble

/**
 * `[number, boolean]`
 *
 * @see `ArrayTypedStructureImpl` for `boolean[]`
 * @see `IndexedAccessTypedStructureImpl` for `Foo["index"]`
 */
export default class TupleTypedStructureImpl
extends ElementsTypedStructureAbstract
implements TupleTypedStructure
{
  static clone(
    other: TupleTypedStructure
  ): TupleTypedStructureImpl
  {
    return new TupleTypedStructureImpl(
      TypeStructureClassesMap.cloneArray(other.elements)
    );
  }

  readonly kind: TypeStructureKind.Tuple = TypeStructureKind.Tuple;

  public readonly prefix = "[";
  public readonly postfix = "]";
  public readonly joinCharacters = ", ";

  constructor(
    elements: TypeStructures[] = [],
  )
  {
    super();
    this.appendStructures(elements);
    registerCallbackForTypeStructure(this);
  }

  appendStructures(
    structuresContext: TypeStructures[]
  ): this
  {
    this.elements.push(...structuresContext);
    return this;
  }
}
TupleTypedStructureImpl satisfies CloneableStructure<TupleTypedStructure>;

TypeStructureClassesMap.set(TypeStructureKind.Tuple, TupleTypedStructureImpl);
