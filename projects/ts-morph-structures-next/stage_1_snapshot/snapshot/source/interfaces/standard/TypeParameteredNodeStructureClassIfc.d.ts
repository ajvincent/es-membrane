import type { TypeParameterDeclarationImpl } from "../../exports.js";

export interface TypeParameteredNodeStructureClassIfc {
  readonly typeParameters: (TypeParameterDeclarationImpl | string)[];
}
