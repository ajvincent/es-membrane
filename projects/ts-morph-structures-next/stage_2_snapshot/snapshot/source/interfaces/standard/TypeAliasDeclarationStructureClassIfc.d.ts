import type { stringOrWriterFunction, TypeStructures } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface TypeAliasDeclarationStructureClassIfc {
  readonly kind: StructureKind.TypeAlias;
  type: stringOrWriterFunction;
  typeStructure: TypeStructures | undefined;
}
