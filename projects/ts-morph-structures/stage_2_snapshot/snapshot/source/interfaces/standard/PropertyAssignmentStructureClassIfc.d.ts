import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface PropertyAssignmentStructureClassIfc {
  readonly kind: StructureKind.PropertyAssignment;
  initializer: stringOrWriterFunction;
}
