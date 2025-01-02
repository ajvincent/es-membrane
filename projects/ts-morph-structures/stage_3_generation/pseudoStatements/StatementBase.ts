import type {
  CodeBlockWriter, WriterFunction
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "#stage_two/snapshot/source/exports.js";

export default
abstract class StatementBase
{
  /**
   * Write a start token, invoke a block, and write the end token, in that order.
   * @param writer - the code block writer.
   * @param startToken - the start token.
   * @param endToken - the end token.
   * @param block - the callback to execute for the block statements.
   *
   * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
   */
  protected pairedWrite(
    writer: CodeBlockWriter,
    startToken: string,
    endToken: string,
    block: () => void,
  ): void {
    writer.write(startToken);
    block();
    writer.write(endToken);
  }

  protected writeArray(
    writer: CodeBlockWriter,
    statementsArray: readonly (stringOrWriterFunction | StatementBase)[]
  ): void
  {
    statementsArray.forEach((statement, index) => {
      this.writeStatement(writer, statement);
      writer.conditionalWrite(index < statementsArray.length - 1, ", ");
    });
  }

  protected writeStatement(
    writer: CodeBlockWriter,
    statement: stringOrWriterFunction | StatementBase,
    newLine = false
  ): void
  {
    if (typeof statement === "object")
      statement = statement.writerFunction;
    if (typeof statement === "function")
      statement(writer);
    else if (newLine)
      writer.writeLine(statement);
    else
      writer.write(statement);
  }

  abstract readonly writerFunction: WriterFunction;
}
