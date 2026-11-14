import type { CodeBlockWriter, WriterFunction } from "ts-morph";

import {
  GET_OUTER_TYPE,
  InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js";

import { StatementStructureKind } from "../../base/StatementStructureKind.js";

import { StatementStructureClassesMap } from "../../base/StatementStructureClassesMap.js";

import type { CloneableStatementStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import { StatementStructuresBase } from "./StatementStructuresBase.js";

/** For `WriterFunction` objects the user provides.  You should never need to construct these manually.  */
export class UnknownWriterStatementImpl
  extends StatementStructuresBase<StatementStructureKind.UnknownWriter>
  implements InnerTypeElement<WriterFunction>
{
  static clone(other: UnknownWriterStatementImpl): UnknownWriterStatementImpl {
    return new UnknownWriterStatementImpl(other[GET_OUTER_TYPE]());
  }

  public readonly kind = StatementStructureKind.UnknownWriter;

  constructor(writer: WriterFunction) {
    super();
    this[WRITER_FUNCTION_KEY] = writer;
  }

  /** @internal */
  protected [WRITER_FUNCTION_KEY]: (writer: CodeBlockWriter) => void;

  public [GET_OUTER_TYPE](): WriterFunction {
    return this[WRITER_FUNCTION_KEY];
  }
}
UnknownWriterStatementImpl satisfies CloneableStatementStructure<UnknownWriterStatementImpl>;
StatementStructureClassesMap.set(
  StatementStructureKind.UnknownWriter,
  UnknownWriterStatementImpl,
);
