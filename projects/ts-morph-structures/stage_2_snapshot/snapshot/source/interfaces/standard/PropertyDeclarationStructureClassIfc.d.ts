import type { StructureKind } from "ts-morph";

export interface PropertyDeclarationStructureClassIfc {
  readonly kind: StructureKind.Property;
  hasAccessorKeyword: boolean;
  isStatic: boolean;
}
