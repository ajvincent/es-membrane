import type {
  TypeStructures,
} from "../../../snapshot/source/exports.js";

import type {
  CloneableTypeStructure,
} from "../../../snapshot/source/internal-exports.js";

import TypeStructureClassesMap from "../../base/TypeStructureClassesMap.js";

import {
  TypeStructureKind
} from "../../base/TypeStructureKind.js";

import TypeStructuresWithChildren from "./TypeStructuresWithChildren.js";

/**
 * @example
 * `Foo["index"]`
 *
 * @see `ArrayTypeStructureImpl` for `boolean[]`
 * @see `MappedTypeStructureImpl` for `{ [key in keyof Foo]: boolean}`
 * @see `MemberedObjectTypeStructureImpl` for `{ [key: string]: boolean }`
 */
export class IndexedAccessTypeStructureImpl
extends TypeStructuresWithChildren<TypeStructureKind.IndexedAccess, [TypeStructures]>
{
  static clone(
    other: IndexedAccessTypeStructureImpl
  ): IndexedAccessTypeStructureImpl
  {
    return new IndexedAccessTypeStructureImpl(
      other.objectType, other.childTypes[0]
    );
  }

  public readonly kind = TypeStructureKind.IndexedAccess;
  public objectType: TypeStructures;
  public readonly childTypes: [TypeStructures];

  protected readonly startToken = "[";
  protected readonly joinChildrenToken = "";
  protected readonly endToken = "]";
  protected readonly maxChildCount = 1;

  constructor(
    objectType: TypeStructures,
    indexType: TypeStructures
  )
  {
    super();
    this.objectType = objectType;
    this.childTypes = [indexType];
  }
}
IndexedAccessTypeStructureImpl satisfies CloneableTypeStructure<IndexedAccessTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.IndexedAccess, IndexedAccessTypeStructureImpl);
