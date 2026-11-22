import { CodeBlockWriter } from "ts-morph";

import { StatementStructureClassesMap } from "../../base/StatementStructureClassesMap.js";

import { StatementStructureKind } from "../../base/StatementStructureKind.js";

import { COPY_FIELDS, WRITE_BETWEEN_TRIVIA } from "../../base/symbolKeys.js";

import type { CloneableStatementStructure } from "../../types/CloneableStructure.js";

import { StatementWithTrivia } from "./StatementWithTrivia.js";

/**
 * @example `;`
 * @deprecated
 */
export class EmptyStatementImpl extends StatementWithTrivia<StatementStructureKind.Empty> {
  public static clone(source: EmptyStatementImpl): EmptyStatementImpl {
    const target = new EmptyStatementImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  readonly kind = StatementStructureKind.Empty;

  protected [WRITE_BETWEEN_TRIVIA](writer: CodeBlockWriter): void {
    writer.writeLine(";");
  }
}
EmptyStatementImpl satisfies CloneableStatementStructure<EmptyStatementImpl>;
StatementStructureClassesMap.set(
  StatementStructureKind.Empty,
  EmptyStatementImpl,
);
