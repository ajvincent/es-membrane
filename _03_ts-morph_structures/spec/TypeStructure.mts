import {
  CodeBlockWriter,
  type CodeBlockWriterOptions,
} from "ts-morph";

import ArrayTypedStructureImpl from "../source/typeStructures/ArrayTypedStructureImpl.mjs";
import FunctionTypedStructureImpl from "../source/typeStructures/FunctionTypedStructureImpl.mjs";
import IndexedAccessTypedStructureImpl from "../source/typeStructures/IndexedAccessTypedStructureImpl.mjs";
import IntersectionTypedStructureImpl from "../source/typeStructures/IntersectionTypedStructureImpl.mjs";
import KeyOfTypeofTypedStructureImpl from "../source/typeStructures/KeyofTypeofTypedStructureImpl.mjs";
import LiteralTypedStructureImpl from "../source/typeStructures/LiteralTypedStructureImpl.mjs";
import StringTypedStructureImpl from "../source/typeStructures/StringTypedStructureImpl.mjs";
import SymbolKeyTypedStructureImpl from "../source/typeStructures/SymbolKeyTypedStructureImpl.mjs";
import TupleTypedStructureImpl from "../source/typeStructures/TupleTypedStructureImpl.mjs";
import TypeArgumentedTypedStructureImpl from "../source/typeStructures/TypeArgumentedTypedStructureImpl.mjs";
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

  it("TupleTypedStructureImpl with readonly = true", () => {
    const typedWriter = new TupleTypedStructureImpl(true);
    typedWriter.elements.push(fooTyped, nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`readonly [foo, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
  });

  it("TupleTypedStructureImpl with readonly = false", () => {
    const typedWriter = new TupleTypedStructureImpl(false);
    typedWriter.elements.push(fooTyped, nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`[foo, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
  });

  it("ArrayWriter with a positive length", () => {
    typedWriter = new ArrayTypedStructureImpl(false, fooTyped, 2);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[2]");
  });

  it("ArrayWriter with a zero length", () => {
    typedWriter = new ArrayTypedStructureImpl(false, fooTyped, 0);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[]");
  });

  it("ArrayWriter with isReadonly set to true", () => {
    typedWriter = new ArrayTypedStructureImpl(true, fooTyped, 0);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("readonly foo[]");
  });

  it("IndexedAccessWriter", () => {
    typedWriter = new IndexedAccessTypedStructureImpl(fooTyped, stringBarTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo["bar"]`);
  });

  it("TypeArgumentedWriter", () => {
    const typedWriter = new TypeArgumentedTypedStructureImpl(fooTyped);
    typedWriter.elements.push(stringBarTyped, nstTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo<"bar", NumberStringType>`);
  });


  it("KeyofTypeofWriter with keyof = true, typeof = false", () => {
    typedWriter = new KeyOfTypeofTypedStructureImpl([true, false], nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("keyof NumberStringType");
  });

  it("KeyofTypeofWriter with keyof = false, typeof = true", () => {
    typedWriter = new KeyOfTypeofTypedStructureImpl([false, true], nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("typeof NumberStringType");
  });

  it("KeyofTypeofWriter with keyof = true, typeof = true", () => {
    typedWriter = new KeyOfTypeofTypedStructureImpl([true, true], nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("keyof typeof NumberStringType");
  });

  describe("FunctionTypeWriter", () => {
    let typedWriter: FunctionTypedStructureImpl;
    it("with an ordinary function", () => {
      typedWriter = new FunctionTypedStructureImpl({
        isConstructor: false,
        parameters: [
          [fooTyped, nstTyped],
          [new LiteralTypedStructureImpl("bar"), new LiteralTypedStructureImpl("boolean")]
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean) => string`);
    });

    it("as a constructor", () => {
      typedWriter = new FunctionTypedStructureImpl({
        isConstructor: true,
        parameters: [
          [fooTyped, nstTyped],
          [new LiteralTypedStructureImpl("bar"), new LiteralTypedStructureImpl("boolean")]
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`new (foo: NumberStringType, bar: boolean) => string`);
    });

    it("with a rest parameter", () => {
      typedWriter = new FunctionTypedStructureImpl({
        isConstructor: false,
        parameters: [
          [fooTyped, nstTyped],
          [new LiteralTypedStructureImpl("bar"), new LiteralTypedStructureImpl("boolean")]
        ],
        restParameter: [new LiteralTypedStructureImpl("args"), new LiteralTypedStructureImpl("object[]")],
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean, ...args: object[]) => string`);
    });

    it("is cloneable", () => {
      typedWriter = new FunctionTypedStructureImpl({
        isConstructor: true,
        parameters: [
          [fooTyped, nstTyped],
          [new LiteralTypedStructureImpl("bar"), new LiteralTypedStructureImpl("boolean")]
        ],
        restParameter: [new LiteralTypedStructureImpl("args"), new LiteralTypedStructureImpl("object[]")],
        returnType: new LiteralTypedStructureImpl("string"),
      });

      expect(
        () => FunctionTypedStructureImpl.clone(typedWriter)
      ).not.toBe(typedWriter);
    });
  });
});
