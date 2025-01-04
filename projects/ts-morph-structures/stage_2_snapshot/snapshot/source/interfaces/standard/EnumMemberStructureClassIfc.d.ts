import type { StructureKind } from "ts-morph";

export interface EnumMemberStructureClassIfc {
  readonly kind: StructureKind.EnumMember;
  /** Convenience property for setting the initializer. */
  value?: number | string;
}
