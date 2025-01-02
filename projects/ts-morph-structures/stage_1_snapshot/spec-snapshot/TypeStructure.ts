import {
  CodeBlockWriter,
} from "ts-morph";

import {
  ArrayTypedStructureImpl,
  ConditionalTypedStructureImpl,
  FunctionTypedStructureImpl,
  FunctionWriterStyle,
  ImportTypedStructureImpl,
  IndexedAccessTypedStructureImpl,
  IntersectionTypedStructureImpl,
  LiteralTypedStructureImpl,
  MappedTypeTypedStructureImpl,
  MemberedObjectTypeStructureImpl,
  ParameterTypedStructureImpl,
  ParenthesesTypedStructureImpl,
  PrefixOperatorsTypedStructureImpl,
  QualifiedNameTypedStructureImpl,
  StringTypedStructureImpl,
  SymbolKeyTypedStructureImpl,
  TemplateLiteralTypedStructureImpl,
  TupleTypedStructureImpl,
  TypeArgumentedTypedStructureImpl,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  UnionTypedStructureImpl,
  WriterTypedStructureImpl,

  createCodeBlockWriter,

  MethodSignatureImpl,
  ParameterDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

describe("TypeStructure for ts-morph (stage 1): ", () => {
  let writer: CodeBlockWriter = createCodeBlockWriter()
  beforeEach(() => writer = createCodeBlockWriter());

  const fooTyped = new LiteralTypedStructureImpl("foo");
  const nstTyped = new LiteralTypedStructureImpl("NumberStringType");
  void(nstTyped);

  const stringBarTyped = new StringTypedStructureImpl("bar");

  it("WriterTypedStructureImpl", () => {
    const typedWriter = new WriterTypedStructureImpl(
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
    const typedWriter = new SymbolKeyTypedStructureImpl("foo");
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("[foo]");

    expect(typedWriter.kind).toBe(TypeStructureKind.SymbolKey);
  });

  it("ParenthesesTypedStructureImpl", () => {
    const typedWriter = new ParenthesesTypedStructureImpl(
      new LiteralTypedStructureImpl("true")
    );
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe("(true)");

    expect(typedWriter.kind).toBe(TypeStructureKind.Parentheses);
  });

  it("PrefixOperatorsTypedStructureImpl", () => {
    const typedWriter = new PrefixOperatorsTypedStructureImpl(
      ["typeof", "readonly"],
      new LiteralTypedStructureImpl("NumberStringType")
    );
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe("typeof readonly NumberStringType");
    expect(typedWriter.kind).toBe(TypeStructureKind.PrefixOperators);
  });

  it("UnionTypedStructureImpl", () => {
    const typedWriter = new UnionTypedStructureImpl;
    typedWriter.childTypes.push(fooTyped);
    typedWriter.childTypes.push(nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo | NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Union);
  });

  it("IntersectionTypedStructureImpl", () => {
    const typedWriter = new IntersectionTypedStructureImpl;
    typedWriter.childTypes.push(fooTyped);
    typedWriter.childTypes.push(nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo & NumberStringType`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Intersection);
  });

  it("TupleTypedStructureImpl", () => {
    const typedWriter = new TupleTypedStructureImpl;
    typedWriter.childTypes.push(fooTyped, nstTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`[foo, NumberStringType]`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Tuple);
  });

  it("QualifiedNameTypedStructureImpl", () => {
    const typedWriter = new QualifiedNameTypedStructureImpl;
    typedWriter.childTypes.push(nstTyped, fooTyped);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`NumberStringType.foo`);
    expect(typedWriter.kind).toBe(TypeStructureKind.QualifiedName);
  });

  it("ArrayTypedStructureImpl", () => {
    const typedWriter = new ArrayTypedStructureImpl(fooTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe("foo[]");

    expect(typedWriter.kind).toBe(TypeStructureKind.Array);
  });

  it("ConditionalTypedStructureImpl", () => {
    const checkType = new LiteralTypedStructureImpl("true");
    const extendsType = new LiteralTypedStructureImpl("ReturnsModified");
    const trueType = new LiteralTypedStructureImpl("BaseClassType");
    const falseType = new LiteralTypedStructureImpl("void");

    const typedWriter = new ConditionalTypedStructureImpl({
      checkType,
      extendsType,
      trueType,
      falseType,
    });

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(
      "true extends ReturnsModified ? BaseClassType : void"
    );

    expect(typedWriter.kind).toBe(TypeStructureKind.Conditional);
  });

  it("IndexedAccessTypedStructureImpl", () => {
    const typedWriter = new IndexedAccessTypedStructureImpl(fooTyped, stringBarTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo["bar"]`);

    expect(typedWriter.kind).toBe(TypeStructureKind.IndexedAccess);
  });

  it("MappedTypeTypedStructureImpl", () => {
    const keyofTypeStructure = new PrefixOperatorsTypedStructureImpl(
      ["keyof"], nstTyped
    );

    const keyTypeStructure = new TypeParameterDeclarationImpl("key");
    keyTypeStructure.constraintStructure = keyofTypeStructure;

    const typedWriter = new MappedTypeTypedStructureImpl(
      keyTypeStructure,
    );
    typedWriter.type = new LiteralTypedStructureImpl("string");
    typedWriter.writerFunction(writer);

    expect<string>(writer.toString()).toBe(`{\n  [key in keyof NumberStringType]: string;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.Mapped);
  });

  it("TypeArgumentedTypedStructureImpl", () => {
    const typedWriter = new TypeArgumentedTypedStructureImpl(fooTyped);
    typedWriter.childTypes.push(stringBarTyped, nstTyped);
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`foo<"bar", NumberStringType>`);

    expect(typedWriter.kind).toBe(TypeStructureKind.TypeArgumented);
  });

  describe("FunctionTypedStructureImpl", () => {
    let typedWriter: FunctionTypedStructureImpl;
    it("with an ordinary function", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: undefined,
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: false,
        typeParameters: [],
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl("boolean"))
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(`(foo: NumberStringType, bar: boolean) => string`);

      expect(typedWriter.kind).toBe(TypeStructureKind.Function);
      expect(typedWriter.parameters[0].kind).toBe(TypeStructureKind.Parameter);
    });

    it("as a constructor", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: undefined,
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: true,
        typeParameters: [],
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
        typeParameters: [],
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
        typeParameters: [],
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
        typeParameters: [],
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
        name: undefined,
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: false,
        typeParameters: [],
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

    it("with type parameters", () => {
      const stringTypeParam = new TypeParameterDeclarationImpl("StringType");
      stringTypeParam.constraintStructure = new LiteralTypedStructureImpl("string");

      const numberTypeParam = new TypeParameterDeclarationImpl("NumberType");
      numberTypeParam.constraintStructure = new LiteralTypedStructureImpl("number");
      numberTypeParam.defaultStructure = new LiteralTypedStructureImpl("1");

      typedWriter = new FunctionTypedStructureImpl({
        name: undefined,
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: false,
        typeParameters: [
          stringTypeParam,
          numberTypeParam,
        ],
        parameters: [
          new ParameterTypedStructureImpl(fooTyped, nstTyped),
          new ParameterTypedStructureImpl("bar", new LiteralTypedStructureImpl(numberTypeParam.name)),
        ],
        restParameter: undefined,
        returnType: new LiteralTypedStructureImpl("string"),
      });

      typedWriter.writerFunction(writer);
      expect<string>(writer.toString()).toBe(
        `<StringType extends string, NumberType extends number = 1>(foo: NumberStringType, bar: NumberType) => string`
      );

      expect(typedWriter.kind).toBe(TypeStructureKind.Function);
      expect(typedWriter.typeParameters).toEqual([stringTypeParam, numberTypeParam]);
      expect(typedWriter.parameters[0].kind).toBe(TypeStructureKind.Parameter);
    });

    it("is cloneable", () => {
      typedWriter = new FunctionTypedStructureImpl({
        name: undefined,
        writerStyle: FunctionWriterStyle.Arrow,
        isConstructor: true,
        typeParameters: [],
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

  it("TemplateLiteralTypedStructureImpl", () => {
    const AB = new UnionTypedStructureImpl;
    AB.childTypes = [new StringTypedStructureImpl("A"), new StringTypedStructureImpl("B")];

    const CD = new UnionTypedStructureImpl;
    CD.childTypes = [new StringTypedStructureImpl("C"), new StringTypedStructureImpl("D")];

    const typedWriter = new TemplateLiteralTypedStructureImpl([
      "one", AB, "two", CD, "three"
    ]);

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe('`one${"A" | "B"}two${"C" | "D"}three`');

    expect(typedWriter.kind).toBe(TypeStructureKind.TemplateLiteral);
  });

  it("ObjectLiteralTypedStructureImpl", () => {
    const typedWriter = new MemberedObjectTypeStructureImpl;

    const fooMethod = new MethodSignatureImpl("foo");
    typedWriter.methods.push(fooMethod);

    const param = new ParameterDeclarationImpl("firstArg");
    fooMethod.parameters.push(param);
    param.type = "string";

    fooMethod.returnTypeStructure = new LiteralTypedStructureImpl("void");

    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`{\n  foo(firstArg: string): void;\n}`);

    expect(typedWriter.kind).toBe(TypeStructureKind.MemberedObject);
  });

  it("ImportTypedStructureImpl", () => {
    const typedWriter = new ImportTypedStructureImpl(
      stringBarTyped, nstTyped, [fooTyped]
    );
    typedWriter.writerFunction(writer);
    expect<string>(writer.toString()).toBe(`import("bar").NumberStringType<foo>`);
    expect(typedWriter.kind).toBe(TypeStructureKind.Import);
  });
});
