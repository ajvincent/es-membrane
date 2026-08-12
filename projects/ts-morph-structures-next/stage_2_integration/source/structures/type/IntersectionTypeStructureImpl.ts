import {
  TypeStructureKind,
  type TypeStructures
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../../snapshot/source/internal-exports.js";

/** @example `Foo & Bar & ...` */
export default
class IntersectionTypeStructureImpl
extends TypeStructuresWithChildren<TypeStructureKind.Intersection, TypeStructures[]>
{
  static clone(
    other: IntersectionTypeStructureImpl
  ): IntersectionTypeStructureImpl
  {
    return new IntersectionTypeStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind = TypeStructureKind.Intersection;
  protected readonly objectType: null = null;
  public childTypes: TypeStructures[];
  protected readonly startToken = "";
  protected readonly joinChildrenToken = " & ";
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
IntersectionTypeStructureImpl satisfies CloneableTypeStructure<IntersectionTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Intersection, IntersectionTypeStructureImpl);
