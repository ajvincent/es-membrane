import {
  CodeBlockWriter,
} from "ts-morph";

/**
 * Write a start token, invoke a block, and write the end token, in that order.
 * @param writer - the code block writer.
 * @param startToken - the start token.
 * @param endToken - the end token.
 * @param newLine - true if we should call `.newLine()` after the start and before the end.
 * @param indent - true if we should indent the block statements.
 * @param block - the callback to execute for the block statements.
 *
 * @see {@link https://github.com/dsherret/code-block-writer/issues/44}
 */
export default function pairedWrite(
  this: void,
  writer: CodeBlockWriter,
  startToken: string,
  endToken: string,
  newLine: boolean,
  indent: boolean,
  block: () => void
) : void
{
  writer.write(startToken);
  if (newLine)
    writer.newLine();
  if (indent)
    writer.indent(block);
  else
    block();
  if (newLine)
    writer.newLine();
  writer.write(endToken);
}
