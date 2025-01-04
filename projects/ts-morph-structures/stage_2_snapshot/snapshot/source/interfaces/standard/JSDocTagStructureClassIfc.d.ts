import type { stringOrWriterFunction } from "../../exports.js";
import type { StructureKind } from "ts-morph";

export interface JSDocTagStructureClassIfc {
  readonly kind: StructureKind.JSDocTag;
  /** The name for the JS doc tag that comes after the "at" symbol. */
  tagName: string;
  /** The text that follows the tag name. */
  text?: stringOrWriterFunction;
}
