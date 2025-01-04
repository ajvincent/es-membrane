import type { StructureKind } from "ts-morph";

export interface GetAccessorDeclarationStructureClassIfc {
  readonly kind: StructureKind.GetAccessor;
  isStatic: boolean;
}
