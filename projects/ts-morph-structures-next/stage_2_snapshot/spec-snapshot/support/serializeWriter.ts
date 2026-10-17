import {
  CodeBlockWriter,
  type WriterFunction
} from "ts-morph";

export function serializeWriter(
  callback: WriterFunction
): string
{
  const writer = new CodeBlockWriter();
  callback(writer);
  return writer.toString();
}
