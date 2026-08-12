import type { stringOrWriterFunction, TypeStructures } from "../../exports.js";

export interface TypedNodeStructureClassIfc {
  type?: stringOrWriterFunction;
  typeStructure: TypeStructures | undefined;
}
