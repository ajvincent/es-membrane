import { WriterFunction } from "ts-morph";
import CodeBlockWriter, {
  type Options as CodeBlockWriterOptions
} from "code-block-writer";

export const writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
  indentNumberOfSpaces: 2
});

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
