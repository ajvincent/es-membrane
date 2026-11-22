import type { NodeWriter } from "../types/ts-morph-nodewriter.js";

export enum StatementStructureKind {
  UnknownString = 1002000000,
  Comment,
  Keyword, // break, continue, debugger, `;`, etc.
  Expression, // return, yield, await, throw, void, etc., or "none" for a simple ExpressionStatement
  Block,
  If,
  Switch,
  Case,
  While,
  Try,
  ForCondition,
  ForIn,
  ForOf,
  Label,
  ImportEquals,
  Module,
  With,
  NotEmitted,

  /** @deprecated */
  UnknownWriter,
  /** @deprecated */
  Empty,
}

export interface KindedStatementStructure<
  TKind extends StatementStructureKind,
> extends NodeWriter {
  readonly kind: TKind;
}
