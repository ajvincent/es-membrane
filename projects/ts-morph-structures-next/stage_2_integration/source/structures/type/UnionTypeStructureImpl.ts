import {
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import type {
  CloneableTypeStructure,
} from "../../types/CloneableStructure.js";

import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import type {
  TypeStructures
} from "./TypeStructures.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";

/** @example `Foo | Bar | ...` */
export class UnionTypeStructureImpl
extends TypeStructuresWithChildren<TypeStructureKind.Union, TypeStructures[]>
{
  static clone(
    other: UnionTypeStructureImpl
  ): UnionTypeStructureImpl
  {
    return new UnionTypeStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind = TypeStructureKind.Union;
  protected readonly objectType: null = null;
  public childTypes: TypeStructures[];
  protected readonly startToken = "";
  protected readonly joinChildrenToken = " | ";
  protected readonly endToken = "";
  protected readonly maxChildCount = Infinity;

  constructor(
    childTypes: TypeStructures[] = []
  )
  {
    super();
    this.childTypes = childTypes;
  }
}
UnionTypeStructureImpl satisfies CloneableTypeStructure<UnionTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Union, UnionTypeStructureImpl);
