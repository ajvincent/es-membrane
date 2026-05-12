import type { stringOrWriterFunction } from "#stage_two/snapshot/source/exports.js";
import type { CodeBlockWriter } from "ts-morph";
import type ExpressionBase from "../ExpressionBase.js";
import type { WriterInterface } from "#stage_three/generation/types/WriterInterface.js";

export class ObjectLiteralExpressionMap
extends Map<string, stringOrWriterFunction | ExpressionBase>
implements WriterInterface
{
  #writerFunction(
    writer: CodeBlockWriter
  ): void
  {
    let counter: number = this.size;
    for (const [key, value] of this.entries()) {
      writer.write(key);
      writer.write(": ");

      if (typeof value === "object")
        value.writerFunction(writer);
      else if (typeof value === "function")
        value(writer);
      else
        writer.write(value);

      if (--counter > 0)
        writer.writeLine(",");
    }
  }

  readonly writerFunction = (writer: CodeBlockWriter): void => {
    writer.block(() => this.#writerFunction(writer));
  }
}
