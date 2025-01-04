import type { StructureKind } from "ts-morph";

export interface ImportAttributeStructureClassIfc {
  readonly kind: StructureKind.ImportAttribute;
  /** Expression value. Quote this when providing a string. */
  value: string;
}
