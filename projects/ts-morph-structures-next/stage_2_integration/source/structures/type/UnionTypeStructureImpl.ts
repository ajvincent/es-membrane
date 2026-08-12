import {
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../../snapshot/source/internal-exports.js";

/** @example `Foo | Bar | ...` */
export default
class UnionTypeStructureImpl
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
    this.registerCallbackForTypeStructure();
  }
}
UnionTypeStructureImpl satisfies CloneableTypeStructure<UnionTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Union, UnionTypeStructureImpl);
