import { type CodeBlockWriter, printStructure } from "ts-morph";

import { StatementStructureKind } from "../../base/StatementStructureKind.js";

import {
  COPY_FIELDS,
  WRITE_BETWEEN_TRIVIA,
  WRITE_STATEMENTS_SEQUENCE,
} from "../../base/symbolKeys.js";

import type { stringOrWriterFunction } from "../../types/stringOrWriterFunction.js";

import { isTSMorphStatementStructure } from "../standard/isStructureOfType.js";

import { WRITER_FUNCTION_KEY } from "../WriterStructuresBase.js";

import type { AugmentedStatementStructures } from "./AugmentedStatements.js";

import { StatementStructuresBase } from "./StatementStructuresBase.js";

export abstract class StatementWithTrivia<
  Kind extends StatementStructureKind,
> extends StatementStructuresBase<Kind> {
  /** @internal */
  protected static [COPY_FIELDS](
    source: StatementWithTrivia<StatementStructureKind>,
    target: StatementWithTrivia<StatementStructureKind>,
  ): void {
    if (Array.isArray(source.leadingTrivia)) {
      target.leadingTrivia.push(...source.leadingTrivia);
    } else if (source.leadingTrivia !== undefined) {
      target.leadingTrivia.push(source.leadingTrivia);
    }

    if (Array.isArray(source.trailingTrivia)) {
      target.trailingTrivia.push(...source.trailingTrivia);
    } else if (source.trailingTrivia !== undefined) {
      target.trailingTrivia.push(source.trailingTrivia);
    }
  }

  protected static [WRITE_STATEMENTS_SEQUENCE](
    keyword: string,
    writeExpressions: [never[], string] | null,
    useBlock: boolean,
    statements: readonly AugmentedStatementStructures[],
    trailingSemi: boolean,
    writer: CodeBlockWriter,
  ): void {
    writer.write(keyword);
    writer.conditionalWrite(
      writeExpressions !== null || statements.length > 0,
      " ",
    );
    if (writeExpressions) {
      this.#writeExpressionsSequence(...writeExpressions);
    }

    if (useBlock) {
      writer.block(() => this.#writeStatementsSequence(statements, writer));
    } else {
      this.#writeStatementsSequence(statements, writer);
    }

    writer.conditionalWrite(trailingSemi, ";");
    writer.newLineIfLastNot();
  }

  static #writeStatementsSequence(
    statements: readonly AugmentedStatementStructures[],
    writer: CodeBlockWriter,
  ): void {
    for (const statement of statements) {
      if (isTSMorphStatementStructure(statement)) {
        writer.write(printStructure(statement));
      } else {
        statement.writerFunction(writer);
      }
    }
  }

  static #writeExpressionsSequence(
    expressions: never[],
    delimiter: string,
  ): never {
    void expressions;
    void delimiter;
    throw new Error("not yet implemented");
  }

  /** Leading comments or whitespace. */
  readonly leadingTrivia: stringOrWriterFunction[] = [];
  /** Trailing comments or whitespace. */
  readonly trailingTrivia: stringOrWriterFunction[] = [];

  /** @internal */
  protected [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void {
    this.#writeTrivia(true, writer);
    this[WRITE_BETWEEN_TRIVIA](writer);
    this.#writeTrivia(false, writer);
  }

  #writeTrivia(isLeading: boolean, writer: CodeBlockWriter): void {
    const iterator = isLeading ? this.leadingTrivia : this.trailingTrivia;
    for (const trivia of iterator) {
      if (typeof trivia === "function") trivia(writer);
      else writer.writeLine(trivia);
    }
  }

  /** @internal */
  protected abstract [WRITE_BETWEEN_TRIVIA](writer: CodeBlockWriter): void;
}
