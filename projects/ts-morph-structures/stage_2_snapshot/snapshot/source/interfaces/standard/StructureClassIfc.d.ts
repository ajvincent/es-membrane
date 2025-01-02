import type { stringOrWriterFunction } from "../../exports.js";

export interface StructureClassIfc {
  /** Leading comments or whitespace. */
  readonly leadingTrivia: stringOrWriterFunction[];
  /** Trailing comments or whitespace. */
  readonly trailingTrivia: stringOrWriterFunction[];
}
