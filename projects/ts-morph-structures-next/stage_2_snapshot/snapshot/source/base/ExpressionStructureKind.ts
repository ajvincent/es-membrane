import type { NodeWriter } from "../types/ts-morph-nodewriter.js";

export enum ExpressionStructureKind {
  UnknownString = 1001000000,
}

export interface KindedTypeStructure<
  TKind extends ExpressionStructureKind,
> extends NodeWriter {
  readonly kind: TKind;
}
