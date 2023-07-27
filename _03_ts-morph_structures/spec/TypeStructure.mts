import {
  CodeBlockWriter,
  type CodeBlockWriterOptions,
} from "ts-morph";

import {
  ArrayTypedStructureImpl,
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  IndexedAccessTypedStructureImpl,
  IntersectionTypedStructureImpl,
  KeyOfTypeofTypedStructureImpl,
  LiteralTypedStructureImpl,
  ParameterTypedStructureImpl,
  StringTypedStructureImpl,
  SymbolKeyTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeStructure,
  TypeStructureKind,
  UnionTypedStructureImpl,
  WriterTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";

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
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: false,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean) => string`);
    });

    it("as a constructor", () => {
      typedWriter = new FunctionTypedStructureImpl({
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: true,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`new (foo: NumberStringType, bar: boolean) => string`);
    });

    it("as a method", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: "doSomething",
        writerStyle: FunctionWriterStyle.Method,
        isConstructor: false,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`doSomething(foo: NumberStringType, bar: boolean): string`);
    });

    it("as a get accessor", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: "doSomething",
        writerStyle: FunctionWriterStyle.GetAccessor,
        isConstructor: false,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`get doSomething(foo: NumberStringType, bar: boolean): string`);
    });

    it("as a set accessor", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: "doSomething",
        writerStyle: FunctionWriterStyle.SetAccessor,
        isConstructor: false,
        parameters: [
          new ParameterTypedStructureImpl("value", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`set doSomething(value: boolean)`);
    });

    it("with a rest parameter", () => {
      typedWriter = new FunctionTypedStructureImpl({
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: false,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: new ParameterTypedStructureImpl("args", new LiteralTypedStructureImpl("object[]")),
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean, ...args: object[]) => string`);
    });

    it("is cloneable", () => {
      typedWriter = new FunctionTypedStructureImpl({
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: true,
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: new ParameterTypedStructureImpl("args", new LiteralTypedStructureImpl("object[]")),
        returnType: new LiteralTypedStructureImpl("string"),
      });

      expect(
        () => FunctionTypedStructureImpl.clone(typedWriter)
      ).not.toBe(typedWriter);
    });
  });
});
