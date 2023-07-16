import type {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import type {
  TypedNodeWriter
} from "../types/ts-morph-typednodewriter.mjs";

import StringWriter from "./String.mjs";
import SymbolKeyWriter from "./SymbolKey.mjs";
import IndexSignatureWriter from "./IndexSignature.mjs";
import MappedTypeWriter from "./MappedType.mjs";

export default class ObjectLiteralWriter implements TypedNodeWriter
{
  readonly fields = new Map<
    StringWriter | SymbolKeyWriter | IndexSignatureWriter | MappedTypeWriter,
    TypedNodeWriter
  >;

  #writerFunction(writer: CodeBlockWriter): void
  {
    writer.block(() => {
      for (const [key, value] of this.fields) {
        key.writerFunction(writer);
        writer.write(": ");
        value.writerFunction(writer);
        writer.write(",");
        writer.newLine();
      }
    });
  }

  readonly writerFunction: WriterFunction = this.#writerFunction.bind(this);

  addStringEntries(
    entries: [key: string, value: TypedNodeWriter][]
  ): this
  {
    for (const [key, value] of entries) {
      this.fields.set(new StringWriter(key), value);
    }
    return this;
  }

  addSymbolEntries(
    entries: [key: string, value: TypedNodeWriter][]
  ): this
  {
    for (const [key, value] of entries) {
      this.fields.set(new SymbolKeyWriter(key), value);
    }
    return this;
  }

  addIndexSignature(key: string, value: TypedNodeWriter, type: TypedNodeWriter): this
  {
    this.fields.set(
      new IndexSignatureWriter(key, value),
      type
    );
    return this;
  }

  addMappedType(key: string, value: TypedNodeWriter, type: TypedNodeWriter): this
  {
    this.fields.set(
      new MappedTypeWriter(key, value),
      type
    );
    return this;
  }
}
