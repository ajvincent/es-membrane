import type { MethodDeclarationOverloadImpl } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface MethodDeclarationStructureClassIfc {
  readonly kind: StructureKind.Method;
  isStatic: boolean;
  readonly overloads: MethodDeclarationOverloadImpl[];
}
