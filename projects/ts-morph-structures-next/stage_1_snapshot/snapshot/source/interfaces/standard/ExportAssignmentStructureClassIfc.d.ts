import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface ExportAssignmentStructureClassIfc {
  readonly kind: StructureKind.ExportAssignment;
  expression: stringOrWriterFunction;
  isExportEquals: boolean;
}
