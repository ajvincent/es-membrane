import type { StructureKind } from "ts-morph";

export interface ParameterDeclarationStructureClassIfc {
  readonly kind: StructureKind.Parameter;
  isRestParameter: boolean;
}
