import type {
  CodeBlockWriter, WriterFunction
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "#stage_two/snapshot/source/exports.js";

import type {
  WriterInterface
} from "../types/WriterInterface.js";

export default abstract class ExpressionBase implements WriterInterface
{
  protected static mapToWriter(
    this: void,
    expression: stringOrWriterFunction | ExpressionBase
  ): stringOrWriterFunction
  {
    return expression instanceof ExpressionBase ? expression.writerFunction : expression;
  }

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

  protected writeSequence(
    writer: CodeBlockWriter,
    elementSequence: readonly (stringOrWriterFunction | ExpressionBase)[]
  ): void
  {
    elementSequence.forEach((element, index) => {
      this.writeExpression(writer, element);
      writer.conditionalWrite(index < elementSequence.length - 1, ", ");
    });
  }

  protected writeExpression(
    writer: CodeBlockWriter,
    expression: stringOrWriterFunction | WriterInterface,
    newLine = false
  ): void
  {
    if (typeof expression === "object")
      expression = expression.writerFunction;
    if (typeof expression === "function")
      expression(writer);
    else if (newLine)
      writer.writeLine(expression);
    else
      writer.write(expression);
  }

  public abstract readonly writerFunction: WriterFunction;
}
