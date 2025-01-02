import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface TypeAliasDeclarationStructureClassIfc {
  readonly kind: StructureKind.TypeAlias;
  type: stringOrWriterFunction;
}
