import type { TypeStructures } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface IndexSignatureDeclarationStructureClassIfc {
  readonly kind: StructureKind.IndexSignature;
  keyName?: string;
  keyType?: string;
  keyTypeStructure: TypeStructures | undefined;
}
