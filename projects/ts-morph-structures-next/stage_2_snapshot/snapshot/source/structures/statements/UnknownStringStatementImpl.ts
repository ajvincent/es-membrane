import type { CodeBlockWriter } from "ts-morph";

import {
  GET_OUTER_TYPE,
  InnerTypeElement,
} from "../../array-utilities/ShadowArrayImpl.js";

import { StatementStructureKind } from "../../base/StatementStructureKind.js";

import { StatementStructureClassesMap } from "../../base/StatementStructureClassesMap.js";

import type { CloneableStatementStructure } from "../../types/CloneableStructure.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import { StatementStructuresBase } from "./StatementStructuresBase.js";

/** For unparsed strings the user provides.  You should never need to construct these manually.  */
export class UnknownStringStatementImpl
  extends StatementStructuresBase<StatementStructureKind.UnknownString>
  implements InnerTypeElement<string>
{
  static clone(other: UnknownStringStatementImpl): UnknownStringStatementImpl {
    return new UnknownStringStatementImpl(other[GET_OUTER_TYPE]());
  }

  #statement: string;
  public readonly kind = StatementStructureKind.UnknownString;

  public constructor(statement: string) {
    super();
    this.#statement = statement;
  }

  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    writer.write(this.#statement);
  }

  public [GET_OUTER_TYPE](): string {
    return this.#statement;
  }
}
UnknownStringStatementImpl satisfies CloneableStatementStructure<UnknownStringStatementImpl>;
StatementStructureClassesMap.set(
  StatementStructureKind.UnknownString,
  UnknownStringStatementImpl,
);
