import type { CodeBlockWriter, WriterFunction } from "ts-morph";

export const WRITER_FUNCTION_KEY = Symbol("writerFunction");
export const DEREGISTER_WRITER = Symbol("deregister writerFunction");

export abstract class WriterStructuresBase {
  static readonly #writerToStructureMap = new WeakMap<
    WriterFunction,
    WriterStructuresBase
  >();

  public static getWriterStructureForCallback(
    writer: WriterFunction,
  ): WriterStructuresBase | undefined {
    return WriterStructuresBase.#writerToStructureMap.get(writer);
  }

  public readonly writerFunction = (writer: CodeBlockWriter): void => {
    this[WRITER_FUNCTION_KEY](writer);
  };

  constructor() {
    WriterStructuresBase.#writerToStructureMap.set(this.writerFunction, this);
  }

  /** @internal */
  public [DEREGISTER_WRITER](): void {
    WriterStructuresBase.#writerToStructureMap.delete(this.writerFunction);
  }

  /** @internal */
  protected abstract [WRITER_FUNCTION_KEY](writer: CodeBlockWriter): void;

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
  protected static pairedWrite(
    writer: CodeBlockWriter,
    startToken: string,
    endToken: string,
    newLine: boolean,
    indent: boolean,
    block: () => void,
  ): void {
    writer.write(startToken);
    if (newLine) writer.newLine();
    if (indent) writer.indent(block);
    else block();
    if (newLine) writer.newLine();
    writer.write(endToken);
  }
}
