import type { StructureKind } from "ts-morph";

export interface ExportSpecifierStructureClassIfc {
  readonly kind: StructureKind.ExportSpecifier;
  alias?: string;
  isTypeOnly: boolean;
}
