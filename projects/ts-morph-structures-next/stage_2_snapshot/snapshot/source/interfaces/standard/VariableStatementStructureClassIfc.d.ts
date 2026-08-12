import type { VariableDeclarationImpl } from "../../exports.js";
import type { StructureKind, VariableDeclarationKind } from "ts-morph";

export interface VariableStatementStructureClassIfc {
  readonly kind: StructureKind.VariableStatement;
  declarationKind?: VariableDeclarationKind;
  readonly declarations: VariableDeclarationImpl[];
}
