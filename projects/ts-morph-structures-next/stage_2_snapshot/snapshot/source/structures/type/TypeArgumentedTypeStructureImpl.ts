import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import type { TypeStructures } from "./TypeStructures.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";

/**
 * This resolves type parameters, as opposed to defining them.
 *
 * @example
 * `Pick<NumberStringType, "repeatForward">`
 *
 * @see `TypeParameterDeclarationImpl` for `Type<Foo extends object>`
 */
export class TypeArgumentedTypeStructureImpl extends TypeStructuresWithChildren<
  TypeStructureKind.TypeArgumented,
  TypeStructures[]
> {
  static clone(
    other: TypeArgumentedTypeStructureImpl,
  ): TypeArgumentedTypeStructureImpl {
    return new TypeArgumentedTypeStructureImpl(
      TypeStructureClassesMap.clone(other.objectType),
      TypeStructureClassesMap.cloneArray(other.childTypes),
    );
  }

  readonly kind = TypeStructureKind.TypeArgumented;
  public objectType: TypeStructures;
  public childTypes: TypeStructures[];
  protected readonly startToken = "<";
  protected readonly joinChildrenToken = ", ";
  protected readonly endToken = ">";
  protected readonly maxChildCount = Infinity;

  constructor(objectType: TypeStructures, childTypes: TypeStructures[] = []) {
    super();
    this.objectType = objectType;
    this.childTypes = childTypes;
  }
}
TypeArgumentedTypeStructureImpl satisfies CloneableTypeStructure<TypeArgumentedTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.TypeArgumented,
  TypeArgumentedTypeStructureImpl,
);
