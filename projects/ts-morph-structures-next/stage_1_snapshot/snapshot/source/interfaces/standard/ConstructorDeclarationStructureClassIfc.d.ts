import type { ConstructorDeclarationOverloadImpl } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ConstructorDeclarationStructureClassIfc {
  readonly kind: StructureKind.Constructor;
  readonly overloads: ConstructorDeclarationOverloadImpl[];
}
