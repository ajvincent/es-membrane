import type { StructureKind } from "ts-morph";

export interface ImportSpecifierStructureClassIfc {
  readonly kind: StructureKind.ImportSpecifier;
  alias?: string;
  isTypeOnly: boolean;
}
