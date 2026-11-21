import type {
  NodeWriter
} from "../types/ts-morph-nodewriter.js";

export enum StatementStructureKind {
  UnknownString = 1002000000,
  /* @deprecated */
  UnknownWriter,
  Empty,
  Comment,
  Keyword, // break, continue, debugger, etc.
  Expression, // return, yield, await, throw, void, etc., or "none" for a simple ExpressionStatement
  Block,
  ForCondition,
  ForIn,
  ForOf,
  If,
  Switch,
  While,
  Try,
  Label,
  ImportEquals,
  Module,
  With,
  NotEmitted,
}

export interface KindedStatementStructure<
  TKind extends StatementStructureKind
> extends NodeWriter
{
  readonly kind: TKind;
}
