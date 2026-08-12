import type { JSDocTagImpl, stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface JSDocStructureClassIfc {
  readonly kind: StructureKind.JSDoc;
  /**
   * The description of the JS doc.
   * @remarks To force this to be multi-line, add a newline to the front of the string.
   */
  description?: stringOrWriterFunction;
  /** JS doc tags (ex. `&#64;param value - Some description.`). */
  readonly tags: JSDocTagImpl[];
}
