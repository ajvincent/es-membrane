import type { StructureKind } from "ts-morph";

export interface MethodDeclarationOverloadStructureClassIfc {
  readonly kind: StructureKind.MethodOverload;
  isStatic: boolean;
}
