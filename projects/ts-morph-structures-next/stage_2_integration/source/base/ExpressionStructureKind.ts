import type {
  TypedNodeWriter
} from "../../snapshot/source/internal-exports.js";

export enum ExpressionStructureKind {
  Unknown = 1001000000 - 1,
}

export interface KindedTypeStructure<
  TKind extends ExpressionStructureKind
> extends TypedNodeWriter
{
  readonly kind: TKind;
}
