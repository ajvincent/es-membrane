import { WriterFunction } from "ts-morph";
import CodeBlockWriter, {
  type Options as CodeBlockWriterOptions
} from "code-block-writer";

export const writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
  indentNumberOfSpaces: 2
});

/**
 * Use a CodeBlockWriter to serialize a TypeScript type.
 * @param type - the value to serialize.
 * @param writeToString - true to return the writer's contents.
 * @param classWriter - the CodeBlockWriter to write to, if you desire.
 * @returns the serialized type, or undefined if writeToString was false.
 */
export default function extractType(
  type: string | WriterFunction,
  writeToString: boolean,
  classWriter = new CodeBlockWriter(writerOptions),
) : string | undefined
{
  if (typeof type === "string")
    classWriter.write(type);
  else
    type(classWriter);
  return writeToString ? classWriter.toString() : undefined;
}
