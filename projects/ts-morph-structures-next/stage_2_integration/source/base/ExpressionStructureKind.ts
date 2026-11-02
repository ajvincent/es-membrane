import type {
  NodeWriter
} from "../types/ts-morph-nodewriter.js";

export enum ExpressionStructureKind {
  Unknown = 1001000000 - 1,
}

export interface KindedTypeStructure<
  TKind extends ExpressionStructureKind
> extends NodeWriter
{
  readonly kind: TKind;
}
