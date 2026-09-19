import type { TypedNodeWriter } from "../internal-exports.js";

export enum StatementStructureKind {
  Unknown = 1002000000 - 1,
}

export interface KindedTypeStructure<
  TKind extends StatementStructureKind,
> extends TypedNodeWriter {
  readonly kind: TKind;
}
