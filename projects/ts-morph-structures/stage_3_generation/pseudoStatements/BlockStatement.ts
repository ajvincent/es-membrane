import type {
  CodeBlockWriter
} from "ts-morph";

import {
  type stringOrWriterFunction
} from "#stage_two/snapshot/source/exports.js";

import StatementBase from "./StatementBase.js";

export default
class BlockStatementImpl extends StatementBase
{
  readonly #beforeBlock?: stringOrWriterFunction;
  readonly #statements: readonly stringOrWriterFunction[];
  readonly #afterBlock?: stringOrWriterFunction;

  constructor(
    beforeBlock: stringOrWriterFunction,
    statements: readonly stringOrWriterFunction[],
    afterBlock?: stringOrWriterFunction
  )
  {
    super();
    this.#beforeBlock = beforeBlock;
    this.#statements = statements;
    this.#afterBlock = afterBlock;
  }

  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    if (this.#beforeBlock) {
      this.writeStatement(writer, this.#beforeBlock, false);
    }
    writer.block(() => {
      for (const statement of this.#statements) {
        this.writeStatement(writer, statement, true);
      }
    });
    if (this.#afterBlock) {
      this.writeStatement(writer, this.#afterBlock, false);
    }
  }

  readonly writerFunction = this.#writerFunction.bind(this);
}
