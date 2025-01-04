import type { stringOrWriterFunction, TypeStructures } from "../../exports.js";
import type { StructureKind, TypeParameterVariance } from "ts-morph";

export interface TypeParameterDeclarationStructureClassIfc {
  readonly kind: StructureKind.TypeParameter;
  constraint?: stringOrWriterFunction;
  constraintStructure: TypeStructures | undefined;
  default?: stringOrWriterFunction;
  defaultStructure: TypeStructures | undefined;
  isConst: boolean;
  variance?: TypeParameterVariance;
}
