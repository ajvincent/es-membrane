import {
  CodeBlockWriter,
  type CodeBlockWriterOptions,
} from "ts-morph";

import IntersectionTypedStructureImpl from "../source/typeStructures/IntersectionTypedStructureImpl.mjs";
import LiteralTypedStructureImpl from "../source/typeStructures/LiteralTypedStructureImpl.mjs";
import StringTypedStructureImpl from "../source/typeStructures/StringTypedStructureImpl.mjs";
import SymbolKeyTypedStructureImpl from "../source/typeStructures/SymbolKeyTypedStructureImpl.mjs";
import TupleTypedStructureImpl from "../source/typeStructures/TupleTypedStructureImpl.mjs";
import UnionTypedStructureImpl from "../source/typeStructures/UnionTypedStructureImpl.mjs";
import WriterTypedStructureImpl from "../source/typeStructures/WriterTypedStructureImpl.mjs";

import type {
  TypeStructure,
} from "../source/typeStructures/TypeStructure.mjs";

import {
  TypeStructureKind
} from "../source/typeStructures/TypeStructureKind.mjs";

describe("TypeStructure for ts-morph: ", () => {
  const writerOptions: Partial<CodeBlockWriterOptions> = Object.freeze({
    indentNumberOfSpaces: 2
  });

  let writer: CodeBlockWriter = new CodeBlockWriter(writerOptions);
  beforeEach(() => writer = new CodeBlockWriter(writerOptions));

  const fooTyped = new LiteralTypedStructureImpl("foo");
  const nstTyped = new LiteralTypedStructureImpl("NumberStringType");
  void(nstTyped);

  const stringBarTyped = new StringTypedStructureImpl("bar");

  let typedWriter: TypeStructure;

  it("WriterTypedStructureImpl", () => {
    typedWriter = new WriterTypedStructureImpl(
      (writer: CodeBlockWriter) => writer.write("hi mom")
    );

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`hi mom`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Writer);
  });

  it("LiteralTypedStructureImpl", () => {
    fooTyped.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo");
    expect(fooTyped.kind).toBe(TypeStructureKind.Literal);
  });

  it("StringTypedStructureImpl", () => {
    stringBarTyped.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`"bar"`);
    expect(stringBarTyped.kind).toBe(TypeStructureKind.String);
  });

  it("SymbolKeyTypedStructureImpl", () => {
    typedWriter = new SymbolKeyTypedStructureImpl("foo");
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("[foo]");

    expect(typedWriter.kind).toBe(TypeStructureKind.SymbolKey);
  });

  it("UnionTypedStructureImpl", () => {
    const typedWriter = new UnionTypedStructureImpl;
    typedWriter.elements.push(fooTyped);
    typedWriter.elements.push(nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo | NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Union);
  });

  it("IntersectionTypedStructureImpl", () => {
    const typedWriter = new IntersectionTypedStructureImpl;
    typedWriter.elements.push(fooTyped);
    typedWriter.elements.push(nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo & NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Intersection);
  });

  it("TupleTypedStructureImpl", () => {
    const typedWriter = new TupleTypedStructureImpl(true);
    typedWriter.elements.push(fooTyped, nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`[foo, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
  });
});
