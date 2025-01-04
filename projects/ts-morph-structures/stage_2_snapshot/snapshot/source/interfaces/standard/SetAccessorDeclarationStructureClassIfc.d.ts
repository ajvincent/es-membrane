import type { StructureKind } from "ts-morph";

export interface SetAccessorDeclarationStructureClassIfc {
  readonly kind: StructureKind.SetAccessor;
  isStatic: boolean;
}
