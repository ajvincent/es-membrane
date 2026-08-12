import type { stringOrWriterFunction, TypeStructures } from "../../exports.js";

export interface ReturnTypedNodeStructureClassIfc {
  returnType?: stringOrWriterFunction;
  returnTypeStructure: TypeStructures | undefined;
}
