import {
  CodeBlockWriter,
  type CodeBlockWriterOptions,
} from "ts-morph";

import LiteralWriter from "../source/typedNodeWriters/Literal.mjs";
import ParenthesesWriter from "../source/typedNodeWriters/Parentheses.mjs";
import TupleWriter from "../source/typedNodeWriters/Tuple.mjs";
import ArrayWriter from "../source/typedNodeWriters/Array.mjs";
import IndexedAccessWriter from "../source/typedNodeWriters/IndexedAccess.mjs";
import StringWriter from "../source/typedNodeWriters/String.mjs";
import SymbolKeyWriter from "../source/typedNodeWriters/SymbolKey.mjs";
import UnionWriter from "../source/typedNodeWriters/Union.mjs";
import IntersectionWriter from "../source/typedNodeWriters/Intersection.mjs";
import KeyofTypeofWriter from "../source/typedNodeWriters/KeyofTypeof.mjs";
import TypeArgumentedWriter from "../source/typedNodeWriters/TypeArgumented.mjs";
import WriterWrapper from "../source/typedNodeWriters/WriterWrapper.mjs";
import ObjectLiteralWriter from "../source/typedNodeWriters/ObjectLiteral.mjs";
import FunctionTypeWriter from "../source/typedNodeWriters/Function.mjs";

import type {
  TypedNodeWriter
} from "../source/types/ts-morph-typednodewriter.mjs";

describe("TypedNodeWriter for ts-morph: ", () => {
  const writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
    indentNumberOfSpaces: 2
  });

  let writer: CodeBlockWriter = new CodeBlockWriter(writerOptions);
  let typedWriter: TypedNodeWriter;
  beforeEach(() => writer = new CodeBlockWriter(writerOptions));

  const fooWriter = new LiteralWriter("foo");
  const stringBarWriter = new StringWriter("bar");

  const nstWriter = new LiteralWriter("NumberStringType");

  it("LiteralWriter", () => {
    fooWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo");
  });

  it("ParenthesesWriter", () => {
    const typedWriter = new ParenthesesWriter(nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`(NumberStringType)`);
  });

  it("TupleWriter", () => {
    const typedWriter = new TupleWriter;
    typedWriter.children.push(fooWriter, nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`[foo, NumberStringType]`);
  });

  it("ArrayWriter with a positive length", () => {
    typedWriter = new ArrayWriter(false, fooWriter, 2);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[2]");
  });

  it("ArrayWriter with a zero length", () => {
    typedWriter = new ArrayWriter(false, fooWriter, 0);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[]");
  });

  it("ArrayWriter with isReadonly set to true", () => {
    typedWriter = new ArrayWriter(true, fooWriter, 0);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("readonly foo[]");
  });

  it("StringWriter", () => {
    stringBarWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`"bar"`);
  });

  it("SymbolKeyWriter", () => {
    typedWriter = new SymbolKeyWriter("foo");
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("[foo]");
  });

  it("IndexedAccessWriter", () => {
    typedWriter = new IndexedAccessWriter(fooWriter, stringBarWriter);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo["bar"]`);
  });

  it("UnionWriter", () => {
    const typedWriter = new UnionWriter;
    typedWriter.children.push(fooWriter);
    typedWriter.children.push(nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo | NumberStringType`);
  });

  it("IntersectionWriter", () => {
    const typedWriter = new IntersectionWriter;
    typedWriter.children.push(fooWriter);
    typedWriter.children.push(nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo & NumberStringType`);
  });

  it("KeyofTypeofWriter with keyof = true, typeof = false", () => {
    typedWriter = new KeyofTypeofWriter(true, false, nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("keyof NumberStringType");
  });

  it("KeyofTypeofWriter with keyof = false, typeof = true", () => {
    typedWriter = new KeyofTypeofWriter(false, true, nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("typeof NumberStringType");
  });

  it("KeyofTypeofWriter with keyof = true, typeof = true", () => {
    typedWriter = new KeyofTypeofWriter(true, true, nstWriter);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("keyof typeof NumberStringType");
  });

  it("TypeArgumentedWriter", () => {
    const typedWriter = new TypeArgumentedWriter(fooWriter);
    typedWriter.children.push(stringBarWriter, nstWriter);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo<"bar", NumberStringType>`);
  });

  it("WriterWrapper", () => {
    typedWriter = new WriterWrapper((writer: CodeBlockWriter) => writer.write("hi mom"));

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`hi mom`);
  });

  describe("ObjectLiteralWrapper", () => {
    let typedWriter: ObjectLiteralWriter;
    beforeEach(() => typedWriter = new ObjectLiteralWriter);

    it("with a direct field setting", () => {
      typedWriter.fields.set(stringBarWriter, nstWriter);
      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`{\n  "bar": NumberStringType,\n}`);
    });

    it("using addStringEntries", () => {
      typedWriter.addStringEntries([
        ["foo", nstWriter],
        ["bar", new LiteralWriter("false")],
      ]);

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`{\n  "foo": NumberStringType,\n  "bar": false,\n}`);
    });

    it("using addSymbolEntries", () => {
      typedWriter.addSymbolEntries([
        ["foo", nstWriter],
        ["bar", new LiteralWriter("false")],
      ]);

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`{\n  [foo]: NumberStringType,\n  [bar]: false,\n}`);
    });

    it("using addIndexSignature", () => {
      typedWriter.addIndexSignature("Key", new LiteralWriter("string"), new LiteralWriter("boolean"));

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`{\n  [Key: string]: boolean,\n}`);
    });

    it("using addMappedType", () => {
      typedWriter.addMappedType("Property", new KeyofTypeofWriter(true, false, nstWriter), new LiteralWriter("boolean"));

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`{\n  [Property in keyof NumberStringType]: boolean,\n}`);
    });
  });

  describe("FunctionTypeWriter", () => {
    let typedWriter: FunctionTypeWriter;
    it("with an ordinary function", () => {
      typedWriter = new FunctionTypeWriter({
        isConstructor: false,
        parameters: [
          [fooWriter, nstWriter],
          [new LiteralWriter("bar"), new LiteralWriter("boolean")]
        ],
        restParameter: undefined,
        returnType: new LiteralWriter("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean) => string`);
    });

    it("as a constructor", () => {
      typedWriter = new FunctionTypeWriter({
        isConstructor: true,
        parameters: [
          [fooWriter, nstWriter],
          [new LiteralWriter("bar"), new LiteralWriter("boolean")]
        ],
        restParameter: undefined,
        returnType: new LiteralWriter("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`new (foo: NumberStringType, bar: boolean) => string`);
    });

    it("with a rest parameter", () => {
      typedWriter = new FunctionTypeWriter({
        isConstructor: false,
        parameters: [
          [fooWriter, nstWriter],
          [new LiteralWriter("bar"), new LiteralWriter("boolean")]
        ],
        restParameter: [new LiteralWriter("args"), new LiteralWriter("object[]")],
        returnType: new LiteralWriter("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean, ...args: object[]) => string`);
    });
  });
});
