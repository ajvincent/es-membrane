import {
  CodeBlockWriter
} from "ts-morph";

import {
  StatementStructureKind,
} from "../../base/StatementStructureKind.js";

import {
  COPY_FIELDS,
  WRITE_BETWEEN_TRIVIA
} from "../../base/symbolKeys.js";

import type {
  stringOrWriterFunction
} from "../../types/stringOrWriterFunction.js";

import {
  WRITER_FUNCTION_KEY
} from "../WriterStructuresBase.js";

import {
  StatementStructuresBase
} from "./StatementStructuresBase.js";

export abstract class StatementWithTrivia<Kind extends StatementStructureKind>
extends StatementStructuresBase<Kind>
{
  /** @internal */
  protected static [COPY_FIELDS](
    source: StatementWithTrivia<StatementStructureKind>,
    target: StatementWithTrivia<StatementStructureKind>,
  ): void
  {
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

  /** Leading comments or whitespace. */
  readonly leadingTrivia: stringOrWriterFunction[] = [];
  /** Trailing comments or whitespace. */
  readonly trailingTrivia: stringOrWriterFunction[] = [];

  /** @internal */
  protected [WRITER_FUNCTION_KEY](
    writer: CodeBlockWriter
  ): void
  {
    this.#writeTrivia(true, writer);
    this[WRITE_BETWEEN_TRIVIA](writer);
    this.#writeTrivia(false, writer);
  }

  #writeTrivia(
    isLeading: boolean,
    writer: CodeBlockWriter
  ): void
  {
    const iterator = isLeading ? this.leadingTrivia : this.trailingTrivia;
    for (const trivia of iterator) {
      if (typeof trivia === "function")
        trivia(writer);
      else
        writer.writeLine(trivia);
    }
  }

  /** @internal */
  protected abstract [WRITE_BETWEEN_TRIVIA](writer: CodeBlockWriter): void;
}
