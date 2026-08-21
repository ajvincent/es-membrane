import {
  type CodeBlockWriter,
  type WriterFunction,
} from "ts-morph";

import {
  TypeStructureKind,
  TypeStructuresOrNull,
  type StructureImpls,
  type TypeStructures,
} from "../../../snapshot/source/exports.js";

import {
  type CloneableTypeStructure,
  STRUCTURE_AND_TYPES_CHILDREN,
  TypeStructureClassesMap,
  TypeStructuresWithChildren,
} from "../../../snapshot/source/internal-exports.js";

/** @example `never` */
export class SubclassTypeStructureImpl extends TypeStructuresWithChildren<TypeStructureKind.Import, readonly TypeStructures[]> {
  public static clone(other: SubclassTypeStructureImpl): SubclassTypeStructureImpl {
    void other;
    throw new Error("not yet implemented");
  }

  public readonly kind: TypeStructureKind.Import = TypeStructureKind.Import;

  // FIXME: all these are stubs
  protected objectType: TypeStructuresOrNull = null;
  public childTypes: readonly TypeStructures[] = [];
  protected startToken: string = "+";
  protected joinChildrenToken: string = "/";
  protected endToken: string = "-";
  protected maxChildCount: number = -1;
}
SubclassTypeStructureImpl satisfies CloneableTypeStructure<SubclassTypeStructureImpl>;
TypeStructureClassesMap.set(TypeStructureKind.Import, SubclassTypeStructureImpl);
