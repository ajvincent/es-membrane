import type { FunctionDeclarationOverloadImpl } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface FunctionDeclarationStructureClassIfc {
  readonly kind: StructureKind.Function;
  readonly overloads: FunctionDeclarationOverloadImpl[];
}
