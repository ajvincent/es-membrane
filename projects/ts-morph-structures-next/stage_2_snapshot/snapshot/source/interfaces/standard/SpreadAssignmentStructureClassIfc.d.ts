import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface SpreadAssignmentStructureClassIfc {
  readonly kind: StructureKind.SpreadAssignment;
  expression: stringOrWriterFunction;
}
