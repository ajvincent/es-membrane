import {
  TypeStructureKind,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../../snapshot/source/internal-exports.js";

/**
 * This resolves type parameters, as opposed to defining them.
 *
 * @example
 * `Pick<NumberStringType, "repeatForward">`
 *
 * @see `TypeParameterDeclarationImpl` for `Type<Foo extends object>`
 */
export default
class TypeArgumentedTypeStructureImpl
extends TypeStructuresWithChildren<TypeStructureKind.TypeArgumented, TypeStructures[]>
{
  static clone(
    other: TypeArgumentedTypeStructureImpl
  ): TypeArgumentedTypeStructureImpl
  {
    return new TypeArgumentedTypeStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
      TypeStructureClassesMap.cloneArray(other.childTypes)
    );
  }

  readonly kind = TypeStructureKind.TypeArgumented;
  public objectType: TypeStructures;
  public childTypes: TypeStructures[];
  protected readonly startToken = "<";
  protected readonly joinChildrenToken = ", ";
  protected readonly endToken = ">";
  protected readonly maxChildCount = Infinity;

  constructor(
    objectType: TypeStructures,
    childTypes: TypeStructures[] = []
  )
  {
    super();
    this.objectType = objectType;
    this.childTypes = childTypes;
    this.registerCallbackForTypeStructure();
  }
}
TypeArgumentedTypeStructureImpl satisfies CloneableTypeStructure<TypeArgumentedTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.TypeArgumented, TypeArgumentedTypeStructureImpl);
