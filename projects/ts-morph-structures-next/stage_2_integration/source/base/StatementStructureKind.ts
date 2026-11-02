import type {
  NodeWriter
} from "../types/ts-morph-nodewriter.js";

export enum StatementStructureKind {
  UnknownString = 1002000000,
  UnknownWriter,
}

export interface KindedStatementStructure<
  TKind extends StatementStructureKind
> extends NodeWriter
{
  readonly kind: TKind;
}
