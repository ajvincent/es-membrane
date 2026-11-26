import { TypeStructureClassesMap } from "../../base/TypeStructureClassesMap.js";

import { TypeStructureKind } from "../../base/TypeStructureKind.js";

import type { CloneableTypeStructure } from "../../types/CloneableStructure.js";

import type { TypeStructures } from "./TypeStructures.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";
/** @example `Foo & Bar & ...` */
export class IntersectionTypeStructureImpl extends TypeStructuresWithChildren<
  TypeStructureKind.Intersection,
  TypeStructures[]
> {
  static clone(
    other: IntersectionTypeStructureImpl,
  ): IntersectionTypeStructureImpl {
    return new IntersectionTypeStructureImpl(
      TypeStructureClassesMap.cloneArray(other.childTypes),
    );
  }

  readonly kind = TypeStructureKind.Intersection;
  protected readonly objectType: null = null;
  public childTypes: TypeStructures[];
  protected readonly startToken = "";
  protected readonly joinChildrenToken = " & ";
  protected readonly endToken = "";
  protected readonly maxChildCount = Infinity;

  constructor(childTypes: TypeStructures[] = []) {
    super();
    this.childTypes = childTypes;
  }
}
IntersectionTypeStructureImpl satisfies CloneableTypeStructure<IntersectionTypeStructureImpl>;
TypeStructureClassesMap.set(
  TypeStructureKind.Intersection,
  IntersectionTypeStructureImpl,
);
