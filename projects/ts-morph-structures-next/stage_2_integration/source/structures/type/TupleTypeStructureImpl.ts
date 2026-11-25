import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import type {
  CloneableTypeStructure,
} from "../../types/CloneableStructure.js";

import type {
  TypeStructures
} from "./TypeStructures.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";
/**
 * @example
 * `[number, boolean]`
 *
 * @see `ArrayTypeStructureImpl` for `boolean[]`
 * @see `IndexedAccessTypeStructureImpl` for `Foo["index"]`
 * @see `NamedTupleMemberTypeStructureImpl` for `[foo: boolean]`
 */
export class TupleTypeStructureImpl
extends TypeStructuresWithChildren<TypeStructureKind.Tuple, TypeStructures[]>
{
  static clone(
    other: TupleTypeStructureImpl
  ): TupleTypeStructureImpl
  {
    return new TupleTypeStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind = TypeStructureKind.Tuple;
  protected readonly objectType: null = null;
  public childTypes: TypeStructures[];
  protected readonly startToken = "[";
  protected readonly joinChildrenToken = ", ";
  protected readonly endToken = "]";
  protected readonly maxChildCount = Infinity;

  constructor(
    childTypes: TypeStructures[] = []
  )
  {
    super();
    this.childTypes = childTypes;
  }
}
TupleTypeStructureImpl satisfies CloneableTypeStructure<TupleTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Tuple, TupleTypeStructureImpl);
